import { Card, CardHeader, CardBody } from '../ui/Card'
import { Badge } from '../ui/Badge'

export function TableComponent({ columns, data, emptyMessage = 'No records found.' }) {
  if (data.length === 0) {
    return (
      <Card>
        <CardBody className="flex flex-col items-center justify-center py-12">
          <p className="text-slate dark:text-steel">{emptyMessage}</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {columns.map((col) => (
                  <td key={col}>{row[col]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
