package com.cwj.munchgobackend.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Generic paginated response wrapper for list endpoints.
 * Contains pagination metadata alongside the content.
 *
 * @param <T> the type of items in the content list
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {

    /**
     * The list of items for the current page.
     */
    private List<T> content;

    /**
     * Current page number (0-indexed).
     */
    private int page;

    /**
     * Number of items per page.
     */
    private int size;

    /**
     * Total number of elements across all pages.
     */
    private long totalElements;

    /**
     * Total number of pages.
     */
    private int totalPages;

    /**
     * Whether this is the first page.
     */
    private boolean first;

    /**
     * Whether this is the last page.
     */
    private boolean last;

    /**
     * Creates a PageResponse from content list and pagination info.
     *
     * @param content the list of items
     * @param page the current page number
     * @param size the page size
     * @param totalElements total number of elements
     * @param <T> the type of items
     * @return a new PageResponse
     */
    public static <T> PageResponse<T> of(List<T> content, int page, int size, long totalElements) {
        int totalPages = size > 0 ? (int) Math.ceil((double) totalElements / size) : 0;
        return PageResponse.<T>builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .first(page == 0)
                .last(page >= totalPages - 1)
                .build();
    }

    /**
     * Creates a PageResponse from a Spring Data Page.
     *
     * @param page the Spring Data Page
     * @param <T> the type of items
     * @return a new PageResponse
     */
    public static <T> PageResponse<T> from(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    /**
     * Creates a PageResponse by mapping the content using a function.
     *
     * @param page the source PageResponse
     * @param converter the mapping function
     * @param <T> the source type
     * @param <R> the target type
     * @return a new PageResponse with mapped content
     */
    public static <T, R> PageResponse<R> map(PageResponse<T> page, Function<T, R> converter) {
        return PageResponse.<R>builder()
                .content(page.getContent().stream()
                        .map(converter)
                        .collect(Collectors.toList()))
                .page(page.getPage())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }
}
