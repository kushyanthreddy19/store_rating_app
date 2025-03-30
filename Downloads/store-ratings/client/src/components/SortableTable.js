"use client"

import { useState } from "react"

const SortableTable = ({ columns, data, onRowClick }) => {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  })

  const requestSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const getSortedData = () => {
    if (!sortConfig.key) return data

    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1
      }
      return 0
    })
  }

  const getClassNamesFor = (name) => {
    if (!sortConfig) {
      return
    }
    return sortConfig.key === name ? sortConfig.direction : undefined
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => column.sortable !== false && requestSort(column.key)}
                className={column.sortable !== false ? `sortable ${getClassNamesFor(column.key)}` : ""}
              >
                {column.label}
                {column.sortable !== false && (
                  <span className="sort-indicator">
                    {getClassNamesFor(column.key) === "asc"
                      ? " ↑"
                      : getClassNamesFor(column.key) === "desc"
                        ? " ↓"
                        : " ↕"}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {getSortedData().map((row, index) => (
            <tr
              key={row.id || index}
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? "clickable" : ""}
            >
              {columns.map((column) => (
                <td key={`${row.id || index}-${column.key}`}>{column.render ? column.render(row) : row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default SortableTable

