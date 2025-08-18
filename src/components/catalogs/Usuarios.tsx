import React, { useState, useEffect } from 'react';
import { Plus, Edit, Printer, Trash2, Save, X, LogOut, User } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Permiso {
  permisoid: number;
  permiso: string;
  descripcion: string;
}

interface Usuario {
  usuarioid: number;
  usuario: string;
  nombrecompleto: string;
  status: string;
  permisos: Permiso[];
}

interface FormData {
  usuarioid: string;
  usuario: string;
  nombrecompleto: string;
  contrasena: string;
  status: string;
  permisos: number[];
}

const Usuarios: React.FC = () => {
  const { token, user, userPermissions, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showPermissions, setShowPermissions] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    usuarioid: '',
    usuario: '',
    nombrecompleto: '',
    contrasena: '',
    status: 'A',
    permisos: [],
  });
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/usuarios', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsuarios(response.data.filter((u: Usuario) => u.status === 'A'));
      } catch (err) {
        setError('Error al obtener usuarios');
        console.error(err);
      }
    };

    const fetchPermisos = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/permisos', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (Array.isArray(response.data)) {
          setPermisos(response.data);
        } else {
          console.warn('Respuesta de permisos no es un arreglo:', response.data);
          setPermisos([]);
        }
      } catch (err) {
        setError('Error al obtener permisos');
        console.error(err);
      }
    };

    if (token) {
      fetchUsuarios();
      fetchPermisos();
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (formData.usuarioid) {
        await axios.put(`http://localhost:3000/api/usuarios/${formData.usuarioid}`, {
          nombrecompleto: formData.nombrecompleto,
          usuario: formData.usuario,
          contrasena: formData.contrasena,
          status: formData.status,
          userid: user?.id || 1,
        }, { headers: { Authorization: `Bearer ${token}` } });

        await axios.put(`http://localhost:3000/api/usuariopermisos/${formData.usuarioid}`, {
          permisos: formData.permisos,
          userid: user?.id || 1,
        }, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        const response = await axios.post('http://localhost:3000/api/usuarios', {
          nombrecompleto: formData.nombrecompleto,
          usuario: formData.usuario,
          contrasena: formData.contrasena,
          status: formData.status,
          userid: user?.id || 1,
        }, { headers: { Authorization: `Bearer ${token}` } });

        if (formData.permisos.length > 0) {
          await axios.put(`http://localhost:3000/api/usuariopermisos/${response.data.usuarioid}`, {
            permisos: formData.permisos,
            userid: user?.id || 1,
          }, { headers: { Authorization: `Bearer ${token}` } });
        }
      }

      const response = await axios.get('http://localhost:3000/api/usuarios', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarios(response.data.filter((u: Usuario) => u.status === 'A'));
      setShowForm(false);
      setFormData({ usuarioid: '', usuario: '', nombrecompleto: '', contrasena: '', status: 'A', permisos: [] });
    } catch (err) {
      setError('Error al guardar usuario');
      console.error(err);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePermissionChange = (permisoid: number) => {
    setFormData(prev => ({
      ...prev,
      permisos: prev.permisos.includes(permisoid)
        ? prev.permisos.filter(id => id !== permisoid)
        : [...prev.permisos, permisoid],
    }));
  };

  const handleModify = async () => {
    if (selectedRow !== null) {
      const usuario = usuarios[selectedRow];
      try {
        const response = await axios.get(`http://localhost:3000/api/usuariopermisos/${usuario.usuarioid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (Array.isArray(response.data)) {
          setFormData({
            usuarioid: usuario.usuarioid.toString(),
            usuario: usuario.usuario,
            nombrecompleto: usuario.nombrecompleto,
            contrasena: '',
            status: usuario.status,
            permisos: response.data.map((p: any) => p.permisoid), // Corrección: sin catpermiso
          });
          setShowForm(true);
        } else {
          console.warn('Respuesta de permisos no es un arreglo:', response.data);
          setError('Error: respuesta de permisos inválida');
          setFormData({
            usuarioid: usuario.usuarioid.toString(),
            usuario: usuario.usuario,
            nombrecompleto: usuario.nombrecompleto,
            contrasena: '',
            status: usuario.status,
            permisos: [],
          });
          setShowForm(true);
        }
      } catch (err: any) {
        setError('Error al obtener permisos del usuario');
        console.error('Error al obtener permisos:', err);
        if (err.response?.status === 403) {
          console.warn('Permiso denegado para el usuario:', usuario.usuarioid);
        }
        setFormData({
          usuarioid: usuario.usuarioid.toString(),
          usuario: usuario.usuario,
          nombrecompleto: usuario.nombrecompleto,
          contrasena: '',
          status: usuario.status,
          permisos: [],
        });
        setShowForm(true);
      }
    }
  };

  const handleDelete = async () => {
    if (selectedRow !== null) {
      try {
        await axios.delete(`http://localhost:3000/api/usuarios/${usuarios[selectedRow].usuarioid}`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { userid: user?.id || 1 },
        });
        setUsuarios(usuarios.filter((_, index) => index !== selectedRow));
        setSelectedRow(null);
      } catch (err) {
        setError('Error al eliminar usuario');
        console.error(err);
      }
    }
  };

  if (showForm) {
    return (
      <div className="flex-1 bg-white">
        <div className="border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between p-3">
            <h2 className="text-lg font-medium text-gray-900">
              {formData.usuarioid ? 'Modificar Usuario' : 'Nuevo Usuario'}
            </h2>
            <button 
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID:</label>
              <input
                type="text"
                value={formData.usuarioid || (usuarios.length + 1)}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario:</label>
              <input
                type="text"
                value={formData.usuario}
                onChange={(e) => handleInputChange('usuario', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo:</label>
              <input
                type="text"
                value={formData.nombrecompleto}
                onChange={(e) => handleInputChange('nombrecompleto', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña:</label>
              <input
                type="password"
                value={formData.contrasena}
                onChange={(e) => handleInputChange('contrasena', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required={!formData.usuarioid}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estatus:</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="A">Activo</option>
                <option value="B">Baja</option>
              </select>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Permisos</h3>
            <div
              className="border border-gray-300 rounded-md p-2"
              style={{ maxHeight: '300px', overflowY: 'auto' }}
            >
              <div className="grid grid-cols-5 gap-4">
                {permisos.map((permiso) => (
                  <div key={permiso.permisoid} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`permiso-${permiso.permisoid}`}
                      checked={formData.permisos.includes(permiso.permisoid)}
                      onChange={() => handlePermissionChange(permiso.permisoid)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`permiso-${permiso.permisoid}`} className="ml-2 text-sm text-gray-700">
                      {permiso.permiso}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Volver
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (showPermissions) {
    return (
      <div className="flex-1 bg-white p-6">
        <div className="border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between p-3">
            <h2 className="text-lg font-medium text-gray-900">Mis Permisos</h2>
            <button 
              onClick={() => setShowPermissions(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6">
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          <h3 className="text-md font-medium text-gray-700 mb-4">Permisos del usuario: {user?.username}</h3>
          {userPermissions.length > 0 ? (
            <ul className="space-y-2">
              {userPermissions.map(permiso => (
                <li key={permiso.permisoid} className="text-sm text-gray-600">
                  <span className="font-medium">{permiso.permiso}</span>
                  {permiso.descripcion ? `: ${permiso.descripcion}` : ''}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600">No se encontraron permisos.</p>
          )}
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setShowPermissions(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white">
      <div className="border-b border-gray-200 bg-blue-50">
        <div className="flex items-center justify-between p-3">
          <h2 className="text-lg font-medium text-gray-900">Consulta de Usuarios</h2>
          <button className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 pb-3">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Nuevo
          </button>
          <button
            onClick={handleModify}
            disabled={selectedRow === null}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-md transition-colors text-sm"
          >
            <Edit className="w-4 h-4" />
            Modificar
          </button>
          <button
            onClick={() => console.log('Imprimir usuarios')}
            className="flex items-center gap-2 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors text-sm"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
          <button
            onClick={handleDelete}
            disabled={selectedRow === null}
            className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-md transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
          <button
            onClick={() => setShowPermissions(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm"
          >
            <User className="w-4 h-4" />
            Mis Permisos
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">USUARIO</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NOMBRE COMPLETO</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ESTATUS</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuarios.map((usuario, index) => (
              <tr
                key={usuario.usuarioid}
                onClick={() => setSelectedRow(index)}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedRow === index ? 'bg-blue-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 text-sm text-gray-900">{usuario.usuarioid}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{usuario.usuario}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{usuario.nombrecompleto}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{usuario.status === 'A' ? 'Activo' : 'Baja'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Usuarios;