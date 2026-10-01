import { SIZES, SIZE_GUIDE } from '@/lib/site'

export function SizeTable() {
  return (
    <table className="size-table nums">
      <caption className="sr">Size guide, body measurements in inches</caption>
      <thead><tr><th scope="col">Size</th><th scope="col">Chest</th><th scope="col">Waist</th><th scope="col">Length</th></tr></thead>
      <tbody>
        {SIZES.map((s) => (
          <tr key={s}><th scope="row">{s}</th><td>{SIZE_GUIDE[s].chest}</td><td>{SIZE_GUIDE[s].waist}</td><td>{SIZE_GUIDE[s].length}</td></tr>
        ))}
      </tbody>
    </table>
  )
}
