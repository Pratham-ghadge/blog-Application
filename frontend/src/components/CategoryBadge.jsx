const categoryColors = {
    Technology: 'bg-blue-100 text-blue-700',
    Lifestyle: 'bg-pink-100 text-pink-700',
    Travel: 'bg-green-100 text-green-700',
    Food: 'bg-orange-100 text-orange-700',
    Health: 'bg-emerald-100 text-emerald-700',
    Business: 'bg-purple-100 text-purple-700',
    Education: 'bg-yellow-100 text-yellow-700',
    Other: 'bg-gray-100 text-gray-700',
};

export default function CategoryBadge({ category, onClick, active }) {
    const colors = categoryColors[category] || categoryColors.Other;

    return (
        <span
            onClick={onClick}
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all ${colors} ${onClick ? 'cursor-pointer hover:opacity-80' : ''
                } ${active ? 'ring-2 ring-offset-1 ring-blue-400' : ''}`}
        >
            {category}
        </span>
    );
}
