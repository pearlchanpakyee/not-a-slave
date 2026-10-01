import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  History,
  MapPin,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  Store,
  Tag,
  Trash2,
  Utensils,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DEFAULT_RESTAURANTS } from '../data/restaurants';

const CUSTOM_RESTAURANTS_KEY = 'nas:custom_restaurants';
const LUNCH_HISTORY_KEY = 'nas:lunch_history';

const PRICE_OPTIONS = ['$', '$$', '$$$'];

const EMPTY_FORM = {
  name: '',
  district: '',
  priceRange: '$',
  type: '',
};

function readLocalStorage(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw);

    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeLocalStorage(key, value) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // LocalStorage may be unavailable or full.
  }
}

function createRestaurantId() {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getRestaurantKey(restaurant) {
  return `${restaurant.name}__${restaurant.district}__${restaurant.priceRange}__${restaurant.type}`;
}

function formatHistoryDate(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString('zh-HK', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getPriceLabel(priceRange) {
  if (priceRange === '$') {
    return '平價';
  }

  if (priceRange === '$$') {
    return '中價';
  }

  if (priceRange === '$$$') {
    return '高級';
  }

  return priceRange;
}

function matchesPriceBudget(restaurantPrice, selectedBudget) {
  if (!selectedBudget) {
    return true;
  }

  const restaurantLevel = restaurantPrice.length;
  const selectedLevel = selectedBudget.length;

  return restaurantLevel <= selectedLevel;
}

function FilterSelect({
  label,
  icon: Icon,
  value,
  onChange,
  options,
  placeholder,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400">
        <Icon size={14} />
        {label}
      </span>

      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-2xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-gray-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        >
          <option value="">{placeholder}</option>

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>
    </label>
  );
}

function RestaurantTag({ children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
      {children}
    </span>
  );
}

function RestaurantCard({
  restaurant,
  isCustom = false,
  onDelete,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
          <Store size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                {restaurant.name}
              </h3>

              <p className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <MapPin size={13} />
                {restaurant.district}
              </p>
            </div>

            {isCustom && onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(restaurant)}
                className="rounded-xl p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                aria-label={`刪除 ${restaurant.name}`}
                title="刪除自定義餐廳"
              >
                <Trash2 size={16} />
              </button>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <RestaurantTag>
              <Tag size={12} />
              {restaurant.type}
            </RestaurantTag>

            <RestaurantTag>
              {restaurant.priceRange} · {getPriceLabel(restaurant.priceRange)}
            </RestaurantTag>
          </div>
        </div>
      </div>
    </div>
  );
}

function DrawResultCard({
  restaurant,
  onConfirm,
  onRedraw,
  onCancel,
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-amber-300 bg-white shadow-xl shadow-amber-500/10 dark:border-amber-700 dark:bg-gray-900">
      <div className="absolute right-4 top-4">
        <Sparkles className="text-amber-400" size={24} />
      </div>

      <div className="p-6 text-center sm:p-8">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-4xl dark:bg-amber-950/50">
          🍱
        </div>

        <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
          今日抽中
        </p>

        <h2 className="mt-2 font-display text-3xl font-black text-gray-900 dark:text-white">
          {restaurant.name}
        </h2>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <RestaurantTag>
            <MapPin size={12} />
            {restaurant.district}
          </RestaurantTag>

          <RestaurantTag>
            <Tag size={12} />
            {restaurant.type}
          </RestaurantTag>

          <RestaurantTag>
            {restaurant.priceRange}
          </RestaurantTag>
        </div>

        <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
          呢間就係系統幫你抽出嚟嘅今日午餐。
          <br />
          確認前往之後先會正式寫入食飯歷史。
        </p>
      </div>

      <div className="grid border-t border-gray-200 dark:border-gray-800 sm:grid-cols-3">
        <button
          type="button"
          onClick={onConfirm}
          className="flex items-center justify-center gap-2 bg-emerald-500 px-4 py-4 text-sm font-black text-white transition hover:bg-emerald-600 active:scale-[0.98] sm:rounded-bl-3xl"
        >
          <Check size={18} />
          確認前往
        </button>

        <button
          type="button"
          onClick={onRedraw}
          className="flex items-center justify-center gap-2 border-t border-gray-200 px-4 py-4 text-sm font-bold text-gray-700 transition hover:bg-gray-50 active:scale-[0.98] dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800 sm:border-l sm:border-t-0"
        >
          <RefreshCw size={17} />
          再抽一次
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="flex items-center justify-center gap-2 border-t border-gray-200 px-4 py-4 text-sm font-bold text-gray-500 transition hover:bg-gray-50 active:scale-[0.98] dark:border-gray-800 dark:hover:bg-gray-800 sm:border-l sm:border-t-0 sm:rounded-br-3xl"
        >
          <X size={17} />
          取消
        </button>
      </div>
    </div>
  );
}

export default function LunchPage() {
  const [customRestaurants, setCustomRestaurants] = useState(() =>
    readLocalStorage(CUSTOM_RESTAURANTS_KEY, []),
  );

  const [history, setHistory] = useState(() =>
    readLocalStorage(LUNCH_HISTORY_KEY, []),
  );

  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [restaurantForm, setRestaurantForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  const [candidate, setCandidate] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const [toast, setToast] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const allRestaurants = useMemo(() => {
    return [...DEFAULT_RESTAURANTS, ...customRestaurants];
  }, [customRestaurants]);

  const districts = useMemo(() => {
    return [...new Set(allRestaurants.map((restaurant) => restaurant.district))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'zh-Hant'));
  }, [allRestaurants]);

  const types = useMemo(() => {
    return [...new Set(allRestaurants.map((restaurant) => restaurant.type))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'zh-Hant'));
  }, [allRestaurants]);

  const filteredRestaurants = useMemo(() => {
    return allRestaurants.filter((restaurant) => {
      const districtMatches =
        !selectedDistrict ||
        restaurant.district === selectedDistrict;

      const typeMatches =
        !selectedType ||
        restaurant.type === selectedType;

      const budgetMatches =
        matchesPriceBudget(restaurant.priceRange, selectedBudget);

      return districtMatches && typeMatches && budgetMatches;
    });
  }, [
    allRestaurants,
    selectedDistrict,
    selectedType,
    selectedBudget,
  ]);

  const customRestaurantKeys = useMemo(() => {
    return new Set(customRestaurants.map(getRestaurantKey));
  }, [customRestaurants]);

  const recentHistoryIds = useMemo(() => {
    return history
      .slice(0, 3)
      .map((item) => item.restaurantId)
      .filter(Boolean);
  }, [history]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 2800);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast]);

  const showToast = (message, type = 'success') => {
    setToast({
      id: Date.now(),
      message,
      type,
    });
  };

  const handleFormChange = (field, value) => {
    setRestaurantForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (formError) {
      setFormError('');
    }
  };

  const handleAddRestaurant = (event) => {
    event.preventDefault();

    const name = restaurantForm.name.trim();
    const district = restaurantForm.district.trim();
    const type = restaurantForm.type.trim();
    const priceRange = restaurantForm.priceRange;

    if (!name || !district || !type || !priceRange) {
      setFormError('請填寫餐廳名稱、地區、價格及菜系類型。');
      return;
    }

    const newRestaurant = {
      id: createRestaurantId(),
      name,
      district,
      priceRange,
      type,
      createdAt: new Date().toISOString(),
      isCustom: true,
    };

    const duplicateKey = getRestaurantKey(newRestaurant);

    if (customRestaurantKeys.has(duplicateKey)) {
      setFormError('呢間餐廳你之前已經加過喇。');
      return;
    }

    const nextCustomRestaurants = [
      ...customRestaurants,
      newRestaurant,
    ];

    setCustomRestaurants(nextCustomRestaurants);
    writeLocalStorage(
      CUSTOM_RESTAURANTS_KEY,
      nextCustomRestaurants,
    );

    setRestaurantForm(EMPTY_FORM);
    setFormError('');
    setIsAddFormOpen(false);

    showToast(`「${name}」已加入你嘅私藏飯堂！`);
  };

  const handleDeleteCustomRestaurant = (restaurant) => {
    const nextCustomRestaurants = customRestaurants.filter(
      (item) => item.id !== restaurant.id,
    );

    setCustomRestaurants(nextCustomRestaurants);

    writeLocalStorage(
      CUSTOM_RESTAURANTS_KEY,
      nextCustomRestaurants,
    );

    if (candidate?.id === restaurant.id) {
      setCandidate(null);
    }

    showToast(`已移除「${restaurant.name}」。`, 'info');
  };

  const getDrawPool = () => {
    if (filteredRestaurants.length === 0) {
      return [];
    }

    const available = filteredRestaurants.filter(
      (restaurant) =>
        !recentHistoryIds.includes(restaurant.id),
    );

    if (available.length > 0) {
      return available;
    }

    return filteredRestaurants;
  };

  const performDraw = () => {
    const pool = getDrawPool();

    if (pool.length === 0) {
      showToast('冇符合條件嘅餐廳可以抽喎。', 'error');
      return;
    }

    setIsDrawing(true);
    setCandidate(null);

    window.setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * pool.length);
      const selectedRestaurant = pool[randomIndex];

      setCandidate(selectedRestaurant);
      setIsDrawing(false);
    }, 900);
  };

  const handleDraw = () => {
    if (isDrawing) {
      return;
    }

    performDraw();
  };

  const handleRedraw = () => {
    if (isDrawing) {
      return;
    }

    performDraw();
  };

  const handleConfirm = () => {
    if (!candidate) {
      return;
    }

    const historyEntry = {
      id: `lunch-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      restaurantId: candidate.id,
      restaurantName: candidate.name,
      district: candidate.district,
      priceRange: candidate.priceRange,
      type: candidate.type,
      timestamp: new Date().toISOString(),
    };

    const nextHistory = [
      historyEntry,
      ...history,
    ].slice(0, 100);

    setHistory(nextHistory);
    writeLocalStorage(
      LUNCH_HISTORY_KEY,
      nextHistory,
    );

    setCandidate(null);

    showToast(
      `已確認！今日就去「${candidate.name}」食啦 🍱`,
    );
  };

  const handleCancel = () => {
    setCandidate(null);
    setIsDrawing(false);
  };

  const handleResetFilters = () => {
    setSelectedDistrict('');
    setSelectedType('');
    setSelectedBudget('');
  };

  const hasActiveFilters =
    Boolean(selectedDistrict) ||
    Boolean(selectedType) ||
    Boolean(selectedBudget);

  const customRestaurantList = customRestaurants.slice().reverse();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-12 pt-4 sm:px-6">
      <div className="mb-5">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 py-2 text-sm font-medium text-gray-500 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft size={16} />
          返回主頁
        </Link>
      </div>

      <header className="mb-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-3xl dark:bg-orange-950/40">
            🍱
          </div>

          <div>
            <h1 className="font-display text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              今日食咩？
            </h1>

            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
              解決打工仔每日「食乜好」嘅千古難題。
              <br className="sm:hidden" />
              交俾命運幫你決定。
            </p>
          </div>
        </div>
      </header>

      {candidate ? (
        <section className="mb-6">
          <DrawResultCard
            restaurant={candidate}
            onConfirm={handleConfirm}
            onRedraw={handleRedraw}
            onCancel={handleCancel}
          />
        </section>
      ) : (
        <section className="mb-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="p-5 sm:p-7">
            <div className="text-center">
              <div
                className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 text-5xl dark:bg-orange-950/40 ${
                  isDrawing
                    ? 'animate-spin'
                    : ''
                }`}
              >
                {isDrawing ? '🎰' : '🍱'}
              </div>

              <h2 className="mt-5 font-display text-xl font-black text-gray-900 dark:text-white">
                {isDrawing
                  ? '命運決定中……'
                  : '準備好俾命運安排午餐未？'}
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
                {isDrawing
                  ? '唔好郁，呢一刻交俾宇宙。'
                  : `${filteredRestaurants.length} 間餐廳符合你目前嘅篩選條件。`}
              </p>
            </div>

            <button
              type="button"
              onClick={handleDraw}
              disabled={isDrawing || filteredRestaurants.length === 0}
              className="mx-auto mt-6 flex w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-gray-950 px-6 py-4 text-base font-black text-white shadow-lg shadow-gray-950/10 transition hover:bg-gray-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
            >
              {isDrawing ? (
                <>
                  <RefreshCw
                    size={19}
                    className="animate-spin"
                  />
                  抽緊……
                </>
              ) : (
                <>
                  <Sparkles size={19} />
                  立即隨機抽籤
                </>
              )}
            </button>
          </div>
        </section>
      )}

      <section className="mb-6 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-black text-gray-900 dark:text-white">
              🎯 篩選你想食咩
            </h2>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              先篩選，再交俾命運抽。
            </p>
          </div>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <RotateCcw size={13} />
              清除篩選
            </button>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <FilterSelect
            label="地區"
            icon={MapPin}
            value={selectedDistrict}
            onChange={setSelectedDistrict}
            options={districts}
            placeholder="全部地區"
          />

          <FilterSelect
            label="菜系類型"
            icon={Utensils}
            value={selectedType}
            onChange={setSelectedType}
            options={types}
            placeholder="全部類型"
          />

          <FilterSelect
            label="價格預算"
            icon={Tag}
            value={selectedBudget}
            onChange={setSelectedBudget}
            options={PRICE_OPTIONS}
            placeholder="不限預算"
          />
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-800/60">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            目前抽籤池
          </span>

          <span className="font-black text-gray-900 dark:text-white">
            {filteredRestaurants.length} 間
          </span>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
            <Search
              size={28}
              className="mx-auto text-gray-400"
            />

            <p className="mt-3 font-bold text-gray-700 dark:text-gray-200">
              呢個條件搵唔到餐廳喎。
            </p>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              試下放寬地區、菜系或者預算。
            </p>
          </div>
        ) : null}
      </section>

      <section className="mb-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <button
          type="button"
          onClick={() =>
            setIsAddFormOpen((current) => !current)
          }
          className="flex w-full items-center gap-3 p-5 text-left transition hover:bg-gray-50 dark:hover:bg-gray-800/60"
          aria-expanded={isAddFormOpen}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Plus size={21} />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block font-display font-black text-gray-900 dark:text-white">
              我要加餐廳
            </span>

            <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
              加入你嘅私藏飯堂，之後會即時出現喺抽籤池。
            </span>
          </span>

          {isAddFormOpen ? (
            <ChevronUp className="text-gray-400" size={20} />
          ) : (
            <ChevronDown className="text-gray-400" size={20} />
          )}
        </button>

        {isAddFormOpen ? (
          <form
            onSubmit={handleAddRestaurant}
            className="border-t border-gray-200 p-5 dark:border-gray-800"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-xs font-bold text-gray-500 dark:text-gray-400">
                  餐廳名稱 *
                </span>

                <input
                  type="text"
                  value={restaurantForm.name}
                  onChange={(event) =>
                    handleFormChange(
                      'name',
                      event.target.value,
                    )
                  }
                  placeholder="例如：公司樓下嗰間茶記"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  maxLength={80}
                />
              </label>

              <label>
                <span className="mb-1.5 block text-xs font-bold text-gray-500 dark:text-gray-400">
                  地區 *
                </span>

                <input
                  type="text"
                  value={restaurantForm.district}
                  onChange={(event) =>
                    handleFormChange(
                      'district',
                      event.target.value,
                    )
                  }
                  placeholder="例如：觀塘"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  maxLength={30}
                />
              </label>

              <label>
                <span className="mb-1.5 block text-xs font-bold text-gray-500 dark:text-gray-400">
                  菜系類型 *
                </span>

                <input
                  type="text"
                  value={restaurantForm.type}
                  onChange={(event) =>
                    handleFormChange(
                      'type',
                      event.target.value,
                    )
                  }
                  placeholder="例如：泰國菜"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  maxLength={30}
                />
              </label>

              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-xs font-bold text-gray-500 dark:text-gray-400">
                  價格級別 *
                </span>

                <div className="grid grid-cols-3 gap-2">
                  {PRICE_OPTIONS.map((price) => (
                    <button
                      key={price}
                      type="button"
                      onClick={() =>
                        handleFormChange(
                          'priceRange',
                          price,
                        )
                      }
                      className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                        restaurantForm.priceRange ===
                        price
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300'
                      }`}
                    >
                      {price}
                      <span className="ml-1 text-xs font-medium opacity-80">
                        {getPriceLabel(price)}
                      </span>
                    </button>
                  ))}
                </div>
              </label>
            </div>

            {formError ? (
              <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-950/30 dark:text-red-300">
                {formError}
              </div>
            ) : null}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setRestaurantForm(EMPTY_FORM);
                  setFormError('');
                  setIsAddFormOpen(false);
                }}
                className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                取消
              </button>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-600 active:scale-[0.98]"
              >
                <Plus size={17} />
                儲存餐廳
              </button>
            </div>
          </form>
        ) : null}
      </section>

      {customRestaurantList.length > 0 ? (
        <section className="mb-6">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-black text-gray-900 dark:text-white">
                🏠 我嘅私藏飯堂
              </h2>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                呢啲餐廳已經永久保存在你嘅瀏覽器。
              </p>
            </div>

            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              {customRestaurants.length} 間
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {customRestaurantList.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isCustom
                onDelete={handleDeleteCustomRestaurant}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mb-6">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-black text-gray-900 dark:text-white">
              🍴 餐廳池
            </h2>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              預載餐廳 + 你自己新增嘅餐廳。
            </p>
          </div>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            {allRestaurants.length} 間
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              isCustom={Boolean(restaurant.isCustom)}
              onDelete={
                restaurant.isCustom
                  ? handleDeleteCustomRestaurant
                  : undefined
              }
            />
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <button
          type="button"
          onClick={() =>
            setShowHistory((current) => !current)
          }
          className="flex w-full items-center gap-3 p-5 text-left transition hover:bg-gray-50 dark:hover:bg-gray-800/60"
          aria-expanded={showHistory}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
            <History size={20} />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block font-display font-black text-gray-900 dark:text-white">
              食飯歷史
            </span>

            <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
              已確認前往嘅餐廳會記錄喺呢度。
            </span>
          </span>

          <span className="mr-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            {history.length}
          </span>

          {showHistory ? (
            <ChevronUp
              size={20}
              className="text-gray-400"
            />
          ) : (
            <ChevronDown
              size={20}
              className="text-gray-400"
            />
          )}
        </button>

        {showHistory ? (
          <div className="border-t border-gray-200 dark:border-gray-800">
            {history.length === 0 ? (
              <div className="p-8 text-center">
                <Clock3
                  size={30}
                  className="mx-auto text-gray-300 dark:text-gray-600"
                />

                <p className="mt-3 font-bold text-gray-600 dark:text-gray-300">
                  暫時仲未有食飯記錄。
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  抽中之後記得撳「確認前往」喎。
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {history.slice(0, 20).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xl dark:bg-gray-800">
                      🍱
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-gray-900 dark:text-white">
                        {item.restaurantName}
                      </p>

                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {item.district} · {item.type} ·{' '}
                        {item.priceRange}
                      </p>
                    </div>

                    <time className="shrink-0 text-xs text-gray-400">
                      {formatHistoryDate(item.timestamp)}
                    </time>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </section>

      {toast ? (
        <div
          className={`fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold shadow-2xl ${
            toast.type === 'error'
              ? 'bg-red-600 text-white'
              : toast.type === 'info'
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-950'
                : 'bg-emerald-500 text-white'
          }`}
          role="status"
          aria-live="polite"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15">
            {toast.type === 'error' ? (
              <X size={16} />
            ) : toast.type === 'info' ? (
              <Trash2 size={16} />
            ) : (
              <Check size={16} />
            )}
          </span>

          <span className="flex-1">
            {toast.message}
          </span>

          <button
            type="button"
            onClick={() => setToast(null)}
            className="rounded-lg p-1 opacity-70 transition hover:opacity-100"
            aria-label="關閉提示"
          >
            <X size={16} />
          </button>
        </div>
      ) : null}
    </main>
  );
}