// 今日食咩？ — preloaded HK business-district restaurant database + draw logic.
//
// Notes for editing:
// - Rows are [district, name, priceRange, type]. IDs are assigned from row order
//   (id = index + 1), so ADD NEW ROWS AT THE END to keep saved history IDs valid.
// - Most entries are well-known chains; branch availability per district was not
//   individually verified. Edit, add or delete rows freely.
// - Types are normalised from the PRD: 米線 -> 米線麵食, 地道小食 -> 小食.

export const DISTRICTS = ['中環', '銅鑼灣', '鰂魚涌', '觀塘', '旺角', '尖沙咀', '葵芳'];
export const TYPES = ['茶餐廳', '快餐', '米線麵食', '日韓', '輕食咖啡', '小食'];

const rows = [
  // 中環
  ['中環', '蘭芳園', '$$', '茶餐廳'],
  ['中環', '麥文記麵家', '$$', '米線麵食'],
  ['中環', '九記牛腩', '$$', '米線麵食'],
  ['中環', '美心MX', '$', '快餐'],
  ['中環', '大家樂', '$', '快餐'],
  ['中環', '吉野家', '$', '日韓'],
  ['中環', 'Urban Coffee Roaster', '$$', '輕食咖啡'],
  ['中環', 'Pacific Coffee', '$$', '輕食咖啡'],
  // 銅鑼灣
  ['銅鑼灣', '一蘭拉麵', '$$$', '日韓'],
  ['銅鑼灣', '太興', '$$', '茶餐廳'],
  ['銅鑼灣', '翠華餐廳', '$$', '茶餐廳'],
  ['銅鑼灣', '譚仔雲南米線', '$', '米線麵食'],
  ['銅鑼灣', '大快活', '$', '快餐'],
  ['銅鑼灣', '麥當勞', '$', '快餐'],
  ['銅鑼灣', '吉野家', '$', '日韓'],
  ['銅鑼灣', '元氣壽司', '$$', '日韓'],
  // 鰂魚涌
  ['鰂魚涌', 'Deli-O', '$$', '快餐'],
  ['鰂魚涌', '美心MX', '$', '快餐'],
  ['鰂魚涌', '大家樂', '$', '快餐'],
  ['鰂魚涌', '譚仔三哥米線', '$', '米線麵食'],
  ['鰂魚涌', '太興', '$$', '茶餐廳'],
  ['鰂魚涌', '吉野家', '$', '日韓'],
  ['鰂魚涌', 'Pacific Coffee', '$$', '輕食咖啡'],
  ['鰂魚涌', '肯德基', '$', '快餐'],
  // 觀塘
  ['觀塘', '金記冰室', '$$', '茶餐廳'],
  ['觀塘', '大家樂', '$', '快餐'],
  ['觀塘', '大快活', '$', '快餐'],
  ['觀塘', '譚仔雲南米線', '$', '米線麵食'],
  ['觀塘', '太興', '$$', '茶餐廳'],
  ['觀塘', '美心MX', '$', '快餐'],
  ['觀塘', '吉野家', '$', '日韓'],
  ['觀塘', 'Pacific Coffee', '$$', '輕食咖啡'],
  // 旺角
  ['旺角', '譚仔三哥米線', '$', '米線麵食'],
  ['旺角', '太興', '$$', '茶餐廳'],
  ['旺角', '翠華餐廳', '$$', '茶餐廳'],
  ['旺角', '大家樂', '$', '快餐'],
  ['旺角', '大快活', '$', '快餐'],
  ['旺角', '麥當勞', '$', '快餐'],
  ['旺角', '吉野家', '$', '日韓'],
  ['旺角', '街頭魚蛋燒賣', '$', '小食'],
  // 尖沙咀
  ['尖沙咀', '祥興記上海生煎包', '$', '小食'],
  ['尖沙咀', '翠華餐廳', '$$', '茶餐廳'],
  ['尖沙咀', '太興', '$$', '茶餐廳'],
  ['尖沙咀', '大家樂', '$', '快餐'],
  ['尖沙咀', '美心MX', '$', '快餐'],
  ['尖沙咀', '譚仔雲南米線', '$', '米線麵食'],
  ['尖沙咀', '食其家', '$$', '日韓'],
  ['尖沙咀', 'Pacific Coffee', '$$', '輕食咖啡'],
  // 葵芳
  ['葵芳', '葵涌廣場車仔麵', '$', '小食'],
  ['葵芳', '大家樂', '$', '快餐'],
  ['葵芳', '大快活', '$', '快餐'],
  ['葵芳', '譚仔雲南米線', '$', '米線麵食'],
  ['葵芳', '太興', '$$', '茶餐廳'],
  ['葵芳', '美心MX', '$', '快餐'],
  ['葵芳', '吉野家', '$', '日韓'],
  ['葵芳', '麥當勞', '$', '快餐'],
];

export const restaurantDatabase = rows.map(([district, name, priceRange, type], i) => ({
  id: i + 1,
  name,
  district,
  priceRange,
  type,
}));

// Restaurants matching the district / type filters ('' = any).
export function getPool(selectedDistrict, selectedType) {
  return restaurantDatabase.filter(
    (r) => (!selectedDistrict || r.district === selectedDistrict) && (!selectedType || r.type === selectedType)
  );
}

// Filter + anti-repeat draw (PRD logic). recentHistory = IDs of the last few picks.
// If every match was eaten recently, fall back to the full filtered pool.
export function getRandomRestaurant(selectedDistrict, selectedType, recentHistory = []) {
  const filtered = getPool(selectedDistrict, selectedType);
  let available = filtered.filter((r) => !recentHistory.includes(r.id));
  if (available.length === 0) available = filtered;
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}
