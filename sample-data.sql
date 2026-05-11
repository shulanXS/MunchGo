-- ============================================================
-- MunchGo 示例数据
-- 使用方式：
--   Docker: 此文件在 postgres 容器首次启动时自动执行 (docker-entrypoint-initdb.d)
--   本地开发: 启动后端后通过 AdminDashboard 页面上传，或手动执行此 SQL
-- ============================================================

-- ============================================================
-- 用户 (BCrypt 加密密码，cost factor 10)
--   admin123    -> $2b$10$mDq/zL5bJ33/lnAzMK89WOwI0ZOTi1ovs5nIJpT8gCsUsFmu075oe
--   merchant123  -> $2b$10$3Q8yCkjyPZMqrEvzMjtP8.1gTmqQMQJbmawQpIh./vcB5V8BECzqe
--   rider123    -> $2b$10$2TaDbVmtvK3zIlv/QYg1weBpCinFgdyfUVVTDY3dIyOX9BM77EGBi
--   customer123 -> $2b$10$WcsaMt7XASI8nIy9Orc1fO2BewT89olrks.Oa1i8wSpcRSrq6NNnO
-- ============================================================

INSERT INTO users (username, email, password, phone, role) VALUES
  ('admin',    'admin@munchgo.com',    '$2b$10$mDq/zL5bJ33/lnAzMK89WOwI0ZOTi1ovs5nIJpT8gCsUsFmu075oe', '13800000000', 'ADMIN'),
  ('merchant', 'merchant@munchgo.com', '$2b$10$3Q8yCkjyPZMqrEvzMjtP8.1gTmqQMQJbmawQpIh./vcB5V8BECzqe', '13800000001', 'MERCHANT'),
  ('rider',    'rider@munchgo.com',    '$2b$10$2TaDbVmtvK3zIlv/QYg1weBpCinFgdyfUVVTDY3dIyOX9BM77EGBi', '13800000002', 'RIDER'),
  ('customer', 'customer@munchgo.com', '$2b$10$WcsaMt7XASI8nIy9Orc1fO2BewT89olrks.Oa1i8wSpcRSrq6NNnO', '13800000003', 'CUSTOMER')
ON CONFLICT (username) DO NOTHING;

-- ============================================================
-- 餐厅
-- ============================================================

INSERT INTO restaurants (user_id, name, description, address, phone, cuisine_type, rating, image_url, status, min_order_amount, delivery_fee)
  SELECT 2, '湘味小厨', '正宗湘菜，辣而不燥，鲜香可口', '北京市朝阳区建国路88号', '010-88888801', '中餐', 4.5, 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800', 'OPEN', 20.00, 5.00 WHERE NOT EXISTS (SELECT 1 FROM restaurants WHERE name = '湘味小厨');

INSERT INTO restaurants (user_id, name, description, address, phone, cuisine_type, rating, image_url, status, min_order_amount, delivery_fee)
  SELECT 2, '汉堡工坊', '美式手工汉堡，新鲜食材', '北京市朝阳区三里屯路19号', '010-88888802', '快餐', 4.3, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', 'OPEN', 30.00, 4.00 WHERE NOT EXISTS (SELECT 1 FROM restaurants WHERE name = '汉堡工坊');

-- ============================================================
-- 分类
-- ============================================================

INSERT INTO categories (restaurant_id, name, sort_order)
  SELECT 1, '招牌菜', 1 WHERE NOT EXISTS (SELECT 1 FROM categories WHERE restaurant_id = 1 AND name = '招牌菜');
INSERT INTO categories (restaurant_id, name, sort_order)
  SELECT 1, '热菜', 2 WHERE NOT EXISTS (SELECT 1 FROM categories WHERE restaurant_id = 1 AND name = '热菜');
INSERT INTO categories (restaurant_id, name, sort_order)
  SELECT 1, '凉菜', 3 WHERE NOT EXISTS (SELECT 1 FROM categories WHERE restaurant_id = 1 AND name = '凉菜');
INSERT INTO categories (restaurant_id, name, sort_order)
  SELECT 1, '主食', 4 WHERE NOT EXISTS (SELECT 1 FROM categories WHERE restaurant_id = 1 AND name = '主食');
INSERT INTO categories (restaurant_id, name, sort_order)
  SELECT 1, '饮品', 5 WHERE NOT EXISTS (SELECT 1 FROM categories WHERE restaurant_id = 1 AND name = '饮品');
INSERT INTO categories (restaurant_id, name, sort_order)
  SELECT 2, '经典汉堡', 1 WHERE NOT EXISTS (SELECT 1 FROM categories WHERE restaurant_id = 2 AND name = '经典汉堡');
INSERT INTO categories (restaurant_id, name, sort_order)
  SELECT 2, '小食', 2 WHERE NOT EXISTS (SELECT 1 FROM categories WHERE restaurant_id = 2 AND name = '小食');
INSERT INTO categories (restaurant_id, name, sort_order)
  SELECT 2, '饮品', 3 WHERE NOT EXISTS (SELECT 1 FROM categories WHERE restaurant_id = 2 AND name = '饮品');

-- ============================================================
-- 菜单
-- ============================================================

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, available, tags)
  SELECT 1, 1, '剁椒鱼头', '新鲜鳙鱼头，配特制剁椒，鲜辣入味', 68.00, 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800', true, '招牌,辣' WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = '剁椒鱼头');
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, available, tags)
  SELECT 1, 1, '农家小炒肉', '土猪肉配青红椒，锅气十足', 38.00, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800', true, '招牌' WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = '农家小炒肉');
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, available, tags)
  SELECT 1, 2, '红烧肉', '五花肉慢炖，肥而不腻', 48.00, 'https://images.unsplash.com/photo-1623689046286-0561ff6b0e0c?w=800', true, '' WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = '红烧肉');
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, available, tags)
  SELECT 1, 2, '酸辣土豆丝', '爽脆酸辣，下饭神器', 18.00, 'https://images.unsplash.com/photo-1518693990790-2ad3c5e7a78a?w=800', true, '素' WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = '酸辣土豆丝');
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, available, tags)
  SELECT 1, 2, '辣椒炒肉', '湖南经典，辣味浓郁', 32.00, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800', true, '辣' WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = '辣椒炒肉');
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, available, tags)
  SELECT 1, 3, '凉拌黄瓜', '清脆爽口，开胃小菜', 12.00, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800', true, '素' WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = '凉拌黄瓜');
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, available, tags)
  SELECT 1, 4, '米饭', '东北大米', 3.00, '', true, '' WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = '米饭');
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, available, tags)
  SELECT 1, 4, '剁椒蛋炒饭', '蛋炒饭配剁椒，香辣可口', 22.00, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800', true, '' WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = '剁椒蛋炒饭');
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, available, tags)
  SELECT 1, 5, '王老吉', '凉茶饮料', 6.00, '', true, '' WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = '王老吉');
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, available, tags)
  SELECT 1, 5, '可乐', '冰镇可乐', 5.00, '', true, '' WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = '可乐');
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, available, tags)
  SELECT 2, 6, '经典牛肉堡', '100%纯牛肉饼，配生菜番茄', 32.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', true, '' WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = '经典牛肉堡');
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, available, tags)
  SELECT 2, 6, '双层培根堡', '双层牛肉+培根+芝士', 42.00, 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800', true, '' WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = '双层培根堡');
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, available, tags)
  SELECT 2, 6, '香辣鸡腿堡', '酥脆鸡腿排，微辣口味', 28.00, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800', true, '辣' WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = '香辣鸡腿堡');
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, available, tags)
  SELECT 2, 7, '薯条', '黄金酥脆薯条', 12.00, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800', true, '' WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = '薯条');
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, available, tags)
  SELECT 2, 7, '洋葱圈', '酥脆洋葱圈', 14.00, 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=800', true, '' WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = '洋葱圈');
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, available, tags)
  SELECT 2, 8, '可口可乐', '330ml罐装', 8.00, '', true, '' WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = '可口可乐');
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, available, tags)
  SELECT 2, 8, '柠檬茶', '现制柠檬红茶', 15.00, '', true, '' WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = '柠檬茶');

-- ============================================================
-- 地址
-- ============================================================

INSERT INTO addresses (user_id, label, detail, latitude, longitude, is_default)
  SELECT 4, '家', '北京市朝阳区望京街道望京花园A区5号楼1201', 39.996118, 116.470365, true WHERE NOT EXISTS (SELECT 1 FROM addresses WHERE user_id = 4 AND label = '家');
INSERT INTO addresses (user_id, label, detail, latitude, longitude, is_default)
  SELECT 4, '公司', '北京市朝阳区恒通商务园B12栋3层', 39.989092, 116.488523, false WHERE NOT EXISTS (SELECT 1 FROM addresses WHERE user_id = 4 AND label = '公司');
