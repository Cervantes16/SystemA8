import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface Pesada {
    id: number;
    fecha: string;
    hora: string;
    noempleado: string;
    nombre: string;
    kilos: number;
    precio: number;
    total: number;
    lote: number;
}

interface Employee {
    trabajadorid: number;
    noempleado: string;
    nombre: string;
}

interface TipoPrecio {
    precioid: number;
    precio: number | string;
    estatus: number;
}

export default function Pesadas() {
    const { token } = useAuth();
    const [pesadas, setPesadas] = useState<Pesada[]>([]);
    const [lote, setLote] = useState('');
    const [precio, setPrecio] = useState<number | null>(null);
    const [precios, setPrecios] = useState<TipoPrecio[]>([]);
    const [empleadoId, setEmpleadoId] = useState('');
    const [empleado, setEmpleado] = useState<Employee | null>(null);
    const [kilos, setKilos] = useState(0.00000);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const [loadingEmployee, setLoadingEmployee] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                await Promise.all([fetchPesadas(), fetchPrecios()]);
            } catch (error) {
                console.error('Error fetching initial data:', error);
                setErrorMessage('Error al cargar datos iniciales.');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();

        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const fetchPesadas = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/pesadas', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const pesadasArray = Array.isArray(res.data) ? res.data : res.data.data || [];
            setPesadas(pesadasArray);
        } catch (error) {
            console.error('Error al consultar pesadas', error);
            setErrorMessage('Error al conectar con el servidor.');
            setPesadas([]);
        }
    };

    const fetchPrecios = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/tipos-precios-descabece', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPrecios(res.data);
            const defaultPrecio = res.data.find((p: TipoPrecio) => p.estatus === 1)?.precio || 3.70;
            setPrecio(typeof defaultPrecio === 'number' ? defaultPrecio : parseFloat(defaultPrecio as string) || 3.70);
        } catch (error) {
            console.error('Error fetching precios:', error);
            setErrorMessage('Error al cargar precios.');
            setPrecios([]);
            setPrecio(3.70);
        }
    };

    const handleEmployeeEnter = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && empleadoId) {
            setLoadingEmployee(true);
            try {
                const res = await axios.get(`http://localhost:3000/api/trabajadores/${empleadoId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const employeeData = Array.isArray(res.data) ? res.data[0] : res.data;
                setEmpleado(employeeData || null);
                setErrorMessage('');
                setShowPopup(true);
            } catch (error) {
                console.error('Error fetching empleado:', error);
                setErrorMessage('Empleado no encontrado.');
                setEmpleado(null);
            } finally {
                setLoadingEmployee(false);
            }
        }
    };

    const handleGuardar = async () => {
        if (!empleado || !lote || !precio || precio <= 0 || kilos <= 0) {
            setErrorMessage('Todos los campos son requeridos y deben ser mayores a 0.');
            return;
        }

        const total = kilos * precio;
        const hora = currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });
        const fecha = currentTime.toISOString().split('T')[0];

        try {
            await axios.post('http://localhost:3000/api/pesadas', {
                fecha,
                hora,
                noempleado: empleado.noempleado,
                nombre: empleado.nombre,
                kilos,
                precio,
                total,
                lote,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            await fetchPesadas();
            setShowPopup(false);
            resetInputs();
        } catch (error) {
            console.error('Error al guardar pesada', error.response?.data || error);
            setErrorMessage('Error al guardar la pesada: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleVolver = () => {
        setShowPopup(false);
        resetInputs();
    };

    const resetInputs = () => {
        setEmpleadoId('');
        setEmpleado(null);
        setKilos(0.00000);
        setErrorMessage('');
    };

    const formattedDateTime = `${currentTime.toLocaleDateString('es-MX', { month: '2-digit', day: '2-digit', year: 'numeric' })} ${currentTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}`;

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-7xl mx-auto w-full">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Consulta de Pesadas en Tiempo Real</h2>

            {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {errorMessage}
                </div>
            )}

            <div className="overflow-x-auto overflow-y-auto mb-6" style={{ maxHeight: '400px' }}>
                <table className="min-w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Empleado</th>
                            <th className="px-4 py-3">Kilos</th>
                            <th className="px-4 py-3">Precio</th>
                            <th className="px-4 py-3">Total $</th>
                            <th className="px-4 py-3">Lote</th>
                            <th className="px-4 py-3">Hora</th>
                            <th className="px-4 py-3">Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pesadas.map((p) => (
                            <tr key={p.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-4 py-2">{p.id}</td>
                                <td className="px-4 py-2">{p.nombre}</td>
                                <td className="px-4 py-2">{Number(p.kilos).toFixed(5)}</td>
                                <td className="px-4 py-2">{Number(p.precio).toFixed(2)}</td>
                                <td className="px-4 py-2 font-semibold text-green-700">{Number(p.total).toFixed(2)}</td>
                                <td className="px-4 py-2">{p.lote}</td>
                                <td className="px-4 py-2">{p.hora}</td>
                                <td className="px-4 py-2">{p.fecha}</td>
                            </tr>
                        ))}
                        {pesadas.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-3 text-center text-gray-500">
                                    No hay pesadas registradas.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lote</label>
                    <input
                        type="text"
                        value={lote}
                        onChange={(e) => setLote(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="1"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                    <select
                        value={precio || ''}
                        onChange={(e) => setPrecio(parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        disabled={precios.length === 0}
                    >
                        <option value="">Seleccionar...</option>
                        {precios
                            .filter((p) => p.estatus === 1)
                            .map((p) => {
                                const priceValue = typeof p.precio === 'number' ? p.precio : parseFloat(p.precio as any) || 0;
                                return (
                                    <option key={p.precioid} value={priceValue}>
                                        {priceValue.toFixed(2)}
                                    </option>
                                );
                            })}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1"># Empleado</label>
                    <input
                        type="text"
                        value={empleadoId}
                        onChange={(e) => setEmpleadoId(e.target.value)}
                        onKeyDown={handleEmployeeEnter}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="111"
                    />
                </div>
            </div>

            <div className="text-center text-red-600 font-bold mb-4 text-lg">{formattedDateTime}</div>

            {showPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-2/5 max-w-lg">
                        {loadingEmployee ? (
                            <div className="text-center">Cargando...</div>
                        ) : empleado ? (
                            <>
                                <h3 className="text-lg font-semibold mb-4 text-gray-800">Datos del Empleado</h3>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Empleado</label>
                                    <input
                                        type="text"
                                        value={empleado.nombre}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kilos</label>
                                    <input
                                        type="number"
                                        value={kilos}
                                        onChange={(e) => setKilos(parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                        step="0.00001"
                                        placeholder="20.00000"
                                    />
                                </div>
                                <div className="flex justify-end gap-4">
                                    <button
                                        onClick={handleGuardar}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Guardar
                                    </button>
                                    <button
                                        onClick={handleVolver}
                                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                    >
                                        Volver
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div>Error al cargar empleado</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}