package com.cwj.munchgobackend.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Distributed ID generator using Twitter's Snowflake algorithm.
 * Generates unique 64-bit IDs composed of timestamp, datacenter ID, machine ID, and sequence.
 * 
 * ID structure (from most to least significant):
 * - Bits 63-22 (42 bits): Timestamp in milliseconds
 * - Bits 21-12 (10 bits): Datacenter ID
 * - Bits 11-5 (6 bits): Machine ID
 * - Bits 4-0 (12 bits): Sequence number
 */
@Slf4j
@Component
public class SnowflakeIdGenerator {

    private static final long EPOCH = 1704067200000L; // 2024-01-01 00:00:00 UTC
    private static final long DATACENTER_ID_BITS = 5L;
    private static final long MACHINE_ID_BITS = 5L;
    private static final long SEQUENCE_BITS = 12L;

    private static final long MAX_DATACENTER_ID = ~(-1L << DATACENTER_ID_BITS);
    private static final long MAX_MACHINE_ID = ~(-1L << MACHINE_ID_BITS);
    private static final long MAX_SEQUENCE = ~(-1L << SEQUENCE_BITS);

    private static final long MACHINE_ID_SHIFT = SEQUENCE_BITS;
    private static final long DATACENTER_ID_SHIFT = SEQUENCE_BITS + MACHINE_ID_BITS;
    private static final long TIMESTAMP_SHIFT = SEQUENCE_BITS + MACHINE_ID_BITS + DATACENTER_ID_BITS;

    private final long datacenterId;
    private final long machineId;
    private long sequence = 0L;
    private long lastTimestamp = -1L;

    /**
     * Creates a Snowflake ID generator with the specified datacenter and machine IDs.
     *
     * @param datacenterId the datacenter ID (0-31)
     * @param machineId the machine ID (0-31)
     */
    public SnowflakeIdGenerator(long datacenterId, long machineId) {
        if (datacenterId > MAX_DATACENTER_ID || datacenterId < 0) {
            throw new IllegalArgumentException(
                    String.format("Datacenter ID can't be greater than %d or less than 0", MAX_DATACENTER_ID));
        }
        if (machineId > MAX_MACHINE_ID || machineId < 0) {
            throw new IllegalArgumentException(
                    String.format("Machine ID can't be greater than %d or less than 0", MAX_MACHINE_ID));
        }
        this.datacenterId = datacenterId;
        this.machineId = machineId;
    }

    /**
     * Creates a Snowflake ID generator with default datacenter (0) and machine (0) IDs.
     */
    public SnowflakeIdGenerator() {
        this(0, 0);
    }

    /**
     * Generates the next unique ID.
     *
     * @return a unique 64-bit ID
     * @throws IllegalStateException if the system clock moves backwards
     */
    public synchronized long nextId() {
        long timestamp = currentTimeMillis();

        if (timestamp < lastTimestamp) {
            throw new IllegalStateException(
                    String.format("Clock moved backwards. Refusing to generate ID for %d milliseconds",
                            lastTimestamp - timestamp));
        }

        if (lastTimestamp == timestamp) {
            sequence = (sequence + 1) & MAX_SEQUENCE;
            if (sequence == 0) {
                timestamp = waitForNextMillis(lastTimestamp);
            }
        } else {
            sequence = 0L;
        }

        lastTimestamp = timestamp;

        return ((timestamp - EPOCH) << TIMESTAMP_SHIFT)
                | (datacenterId << DATACENTER_ID_SHIFT)
                | (machineId << MACHINE_ID_SHIFT)
                | sequence;
    }

    /**
     * Generates the next unique ID as a String.
     *
     * @return a unique ID string
     */
    public String nextIdString() {
        return String.valueOf(nextId());
    }

    /**
     * Waits until the next millisecond.
     *
     * @param lastTimestamp the last timestamp
     * @return the current timestamp
     */
    private long waitForNextMillis(long lastTimestamp) {
        long timestamp = currentTimeMillis();
        while (timestamp <= lastTimestamp) {
            timestamp = currentTimeMillis();
        }
        return timestamp;
    }

    /**
     * Gets the current time in milliseconds.
     *
     * @return current time in milliseconds
     */
    protected long currentTimeMillis() {
        return System.currentTimeMillis();
    }

    /**
     * Extracts the timestamp component from an ID.
     *
     * @param id the snowflake ID
     * @return the timestamp in milliseconds
     */
    public static long getTimestamp(long id) {
        return (id >> TIMESTAMP_SHIFT) + EPOCH;
    }

    /**
     * Extracts the datacenter ID from an ID.
     *
     * @param id the snowflake ID
     * @return the datacenter ID
     */
    public static long getDatacenterId(long id) {
        return (id >> DATACENTER_ID_SHIFT) & MAX_DATACENTER_ID;
    }

    /**
     * Extracts the machine ID from an ID.
     *
     * @param id the snowflake ID
     * @return the machine ID
     */
    public static long getMachineId(long id) {
        return (id >> MACHINE_ID_SHIFT) & MAX_MACHINE_ID;
    }

    /**
     * Extracts the sequence number from an ID.
     *
     * @param id the snowflake ID
     * @return the sequence number
     */
    public static long getSequence(long id) {
        return id & MAX_SEQUENCE;
    }
}
