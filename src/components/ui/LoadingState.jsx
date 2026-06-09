/**
 * Shimmer skeleton placeholder shown while data is loading.
 * Props: lines (number of skeleton bars), card (wrap in a glass card).
 */
export default function LoadingState({ lines = 3, card = true }) {
  const bars = Array.from({ length: lines })
  const content = (
    <div className="skeleton-lines">
      {bars.map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            height: i === 0 ? 18 : 14,
            width: i === 0 ? '40%' : `${90 - i * 12}%`,
          }}
        />
      ))}
    </div>
  )

  if (!card) return content
  return <div className="glass card">{content}</div>
}
