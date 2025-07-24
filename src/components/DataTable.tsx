import React, { useState } from 'react';
import { Plus, Edit, Trash2, Printer, X, Check } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  width?: string;
}

interface DataTableProps {
  title: string;
  columns: Column[];
  data: any[];
  onNew?: () => void;
  onModify?: (item: any) => void;
  onDelete?: (item: any) => void;
  onPrint?: () => void;
}

export default function DataTable({ 
  title, 
  columns, 
  data, 
  onNew, 
  onModify, 
  onDelete, 
  onPrint 
}: DataTableProps) {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  return (
    <div className="flex-1 bg-white">
      <div className="border-b border-gray-200 bg-blue-50">
        <div className="flex items-center justify-between p-3">
          <h2 className="text-lg font-medium text-gray-900">{title}</h2>
          <button className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 px-3 pb-3">
          {onNew && (
            <button
              onClick={onNew}
              className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Nuevo
            </button>
          )}
          
          {onModify && (
            <button
              onClick={() => selectedRow !== null && onModify(data[selectedRow])}
              disabled={selectedRow === null}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-md transition-colors text-sm"
            >
              <Edit className="w-4 h-4" />
              Modificar
            </button>
          )}
          
          {onPrint && (
            <button
              onClick={onPrint}
              className="flex items-center gap-2 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors text-sm"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={() => selectedRow !== null && onDelete(data[selectedRow])}
              disabled={selectedRow === null}
              className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-md transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          )}
          
          <button className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm">
            <Check className="w-4 h-4" />
            Salir
          </button>
        </div>
      </div>
      
      <div className="overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr
                key={index}
                onClick={() => setSelectedRow(index)}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedRow === index ? 'bg-blue-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-sm text-gray-900">
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}