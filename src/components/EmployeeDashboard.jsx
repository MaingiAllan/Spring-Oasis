import { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Clock, ShoppingBag, Plus, Trash2, AlertTriangle, ArrowUp, ArrowDown, Settings } from 'lucide-react';

export default function EmployeeDashboard({ overrideUser }) {
  const {
    employees,
    inventory,
    employeeClockIn,
    employeeClockOut,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    updateUserCredentials
  } = useSchool();

  // Current Employee Profile
  const defaultEmployee = { id: 'emp-1', name: 'Chef Marcus Wright', role: 'Kitchen Supervisor' };
  const employee = overrideUser || defaultEmployee;

  // Tabs
  const [activeSubTab, setActiveSubTab] = useState('inventory'); // inventory, attendance, settings

  // Settings form states
  const [settingsForm, setSettingsForm] = useState({ username: employee.username || '', password: '', confirmPassword: '' });
  const [settingsSuccess, setSettingsSuccess] = useState(null);
  const [settingsError, setSettingsError] = useState(null);

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    setSettingsError(null);
    setSettingsSuccess(null);
    if (!settingsForm.password) {
      setSettingsError('Password is required.');
      return;
    }
    if (settingsForm.password !== settingsForm.confirmPassword) {
      setSettingsError('Passwords do not match.');
      return;
    }
    updateUserCredentials('employee', employee.id, settingsForm.username, settingsForm.password);
    setSettingsSuccess('Credentials updated successfully!');
    setSettingsForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
  };

  // Find this employee's full details in DB
  const employeeData = employees.find(e => e.id === employee.id) || employee;
  const attendanceLog = employeeData.attendance || [];

  // Get current date
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = attendanceLog.find(a => a.date === todayStr);

  // Form states for inventory
  const [invForm, setInvForm] = useState({ name: '', quantity: '', unit: 'kg', threshold: '10', notes: '' });

  // Handle Clock Actions
  const handleClockIn = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    employeeClockIn(employee.id, todayStr, timeStr);
    alert(`Clocked In successfully at ${timeStr}`);
  };

  const handleClockOut = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    employeeClockOut(employee.id, todayStr, timeStr);
    alert(`Clocked Out successfully at ${timeStr}`);
  };

  // Handle Inventory Actions
  const handleInvSubmit = (e) => {
    e.preventDefault();
    if (!invForm.name || !invForm.quantity || !invForm.threshold) return;

    addInventoryItem({
      name: invForm.name,
      quantity: Number(invForm.quantity),
      unit: invForm.unit,
      threshold: Number(invForm.threshold),
      notes: invForm.notes
    });

    setInvForm({ name: '', quantity: '', unit: 'kg', threshold: '10', notes: '' });
    alert('Kitchen item added to inventory!');
  };

  const adjustQuantity = (item, amount) => {
    const nextQty = Math.max(0, item.quantity + amount);
    updateInventoryItem(item.id, nextQty);
  };

  return (
    <div className="employee-dashboard-root">
      {/* Employee Profile Header */}
      <div className="glass-card mb-md" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2>Staff Portal: {employee.role}</h2>
          <p className="text-sm text-muted">Employee: <span className="font-bold">{employee.name}</span> | Staff ID: <span className="font-bold">{employee.id}</span></p>
        </div>
        
        <nav aria-label="Employee dashboard section tabs" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            id="emp-tab-inventory"
            className={`btn ${activeSubTab === 'inventory' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveSubTab('inventory')}
          >
            <ShoppingBag size={16} /> Kitchen Inventory
          </button>
          <button 
            id="emp-tab-attendance"
            className={`btn ${activeSubTab === 'attendance' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveSubTab('attendance')}
          >
            <Clock size={16} /> My Attendance
          </button>
          <button 
            id="emp-tab-settings"
            className={`btn ${activeSubTab === 'settings' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveSubTab('settings')}
          >
            <Settings size={16} /> Settings
          </button>
        </nav>
      </div>

      {/* 1. KITCHEN INVENTORY */}
      {activeSubTab === 'inventory' && (
        <section id="emp-section-inventory" aria-labelledby="emp-inventory-title">
          <h3 id="emp-inventory-title" className="visually-hidden">Kitchen Cooking Supplies Inventory</h3>
          
          <div className="grid-cols-3">
            {/* Add New Item Form */}
            <div className="glass-card" style={{ gridColumn: 'span 1' }}>
              <h3>Add Cooking Item</h3>
              <form onSubmit={handleInvSubmit} className="mt-md" id="add-inventory-form">
                <div className="form-group">
                  <label htmlFor="inv-name">Item Name *</label>
                  <input 
                    type="text" 
                    id="inv-name" 
                    className="form-control" 
                    placeholder="e.g. Jasmine Rice, Milk" 
                    required
                    value={invForm.name}
                    onChange={(e) => setInvForm({...invForm, name: e.target.value})}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="inv-qty">Quantity *</label>
                    <input 
                      type="number" 
                      id="inv-qty" 
                      min="0"
                      className="form-control" 
                      placeholder="e.g. 50" 
                      required
                      value={invForm.quantity}
                      onChange={(e) => setInvForm({...invForm, quantity: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="inv-unit">Unit *</label>
                    <select 
                      id="inv-unit" 
                      className="form-control" 
                      value={invForm.unit}
                      onChange={(e) => setInvForm({...invForm, unit: e.target.value})}
                    >
                      <option value="kg">kg</option>
                      <option value="Liters">Liters</option>
                      <option value="cans">cans</option>
                      <option value="bags">bags</option>
                      <option value="boxes">boxes</option>
                      <option value="units">units</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="inv-threshold">Alert Threshold (Low stock warning) *</label>
                  <input 
                    type="number" 
                    id="inv-threshold" 
                    min="1"
                    className="form-control" 
                    placeholder="e.g. 10" 
                    required
                    value={invForm.threshold}
                    onChange={(e) => setInvForm({...invForm, threshold: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="inv-notes">Inventory Notes</label>
                  <textarea 
                    id="inv-notes" 
                    className="form-control" 
                    placeholder="Store location, brand details, etc."
                    value={invForm.notes}
                    onChange={(e) => setInvForm({...invForm, notes: e.target.value})}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <Plus size={18} /> Register Item
                </button>
              </form>
            </div>

            {/* Inventory Listing Table */}
            <div className="glass-card" style={{ gridColumn: 'span 2' }}>
              <div className="glass-card-header">
                <h3>Stock Register</h3>
                <span className="badge badge-info">Cooking & Pantry Supplies</span>
              </div>
              
              <div className="table-wrapper">
                <table className="data-table" id="inventory-table">
                  <thead>
                    <tr>
                      <th>Item Details</th>
                      <th>Quantity In Stock</th>
                      <th>Threshold Alert</th>
                      <th className="text-right">Manage Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => {
                      const isLowStock = item.quantity <= item.threshold;
                      return (
                        <tr key={item.id}>
                          <td>
                            <span className="font-bold">{item.name}</span>
                            <span className="text-xs text-muted" style={{ display: 'block' }}>Notes: {item.notes || 'None'}</span>
                            <span className="text-xs text-muted" style={{ display: 'block' }}>Last updated: {item.lastUpdated}</span>
                          </td>
                          <td>
                            <span style={{ 
                              fontSize: '1.1rem', 
                              fontWeight: '700',
                              color: isLowStock ? 'var(--color-error)' : 'var(--color-text-primary)' 
                            }}>
                              {item.quantity} {item.unit}
                            </span>
                          </td>
                          <td>
                            {isLowStock ? (
                              <span className="badge badge-error" style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                                <AlertTriangle size={12} /> Low Stock (&lt;={item.threshold})
                              </span>
                            ) : (
                              <span className="badge badge-success">Sufficient</span>
                            )}
                          </td>
                          <td className="text-right">
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button 
                                className="btn btn-secondary btn-sm"
                                onClick={() => adjustQuantity(item, 5)}
                                title="Add 5"
                              >
                                <ArrowUp size={14} /> +5
                              </button>
                              <button 
                                className="btn btn-secondary btn-sm"
                                onClick={() => adjustQuantity(item, -5)}
                                title="Use 5"
                                disabled={item.quantity === 0}
                              >
                                <ArrowDown size={14} /> -5
                              </button>
                              <button 
                                className="btn btn-danger btn-sm"
                                onClick={() => {
                                  if (window.confirm(`Delete ${item.name}?`)) {
                                    deleteInventoryItem(item.id);
                                  }
                                }}
                                title="Delete Item"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {inventory.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">No items in database.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. EMPLOYEE ATTENDANCE */}
      {activeSubTab === 'attendance' && (
        <section id="emp-section-attendance" aria-labelledby="emp-attendance-title">
          <h3 id="emp-attendance-title" className="visually-hidden">Employee Work Hour Logger</h3>
          
          <div className="grid-cols-3">
            {/* Clock-in Clock-out console */}
            <div className="glass-card" style={{ gridColumn: 'span 1' }}>
              <h3>Time Clock Console</h3>
              <p className="text-sm text-muted mt-xs">Log your daily hours for the school kitchen registry.</p>
              
              <div className="mt-lg text-center">
                <div style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'var(--font-title)', marginBlockEnd: '20px' }}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBlockEnd: '20px' }}>
                  Today is <span className="font-bold">{new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                </div>

                {!todayRecord ? (
                  <button onClick={handleClockIn} className="btn btn-primary" style={{ width: '100%', minHeight: '60px', fontSize: '1.1rem' }}>
                    Clock In For Today
                  </button>
                ) : todayRecord.clockOut === '--' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div className="badge badge-success" style={{ padding: '10px', fontSize: '0.9rem', justifyContent: 'center' }}>
                      Clocked In at {todayRecord.clockIn}
                    </div>
                    <button onClick={handleClockOut} className="btn btn-danger" style={{ width: '100%', minHeight: '60px', fontSize: '1.1rem' }}>
                      Clock Out
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div className="badge badge-info" style={{ padding: '10px', fontSize: '0.9rem', justifyContent: 'center' }}>
                      Shift Completed Today
                    </div>
                    <div className="text-xs text-muted">
                      In: {todayRecord.clockIn} | Out: {todayRecord.clockOut}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Attendance History log */}
            <div className="glass-card" style={{ gridColumn: 'span 2' }}>
              <h3>Shift Log Registry</h3>
              
              <div className="table-wrapper mt-md">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Shift Date</th>
                      <th>Clock In</th>
                      <th>Clock Out</th>
                      <th>Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceLog.map((shift, idx) => (
                      <tr key={idx}>
                        <td><span className="font-bold">{shift.date}</span></td>
                        <td>{shift.clockIn}</td>
                        <td>{shift.clockOut}</td>
                        <td>
                          <span className="badge badge-success">
                            {shift.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {attendanceLog.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">No attendance logs logged yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. STAFF SETTINGS TAB */}
      {activeSubTab === 'settings' && (
        <section id="emp-section-settings" aria-labelledby="emp-settings-title">
          <h3 id="emp-settings-title" className="visually-hidden">Employee Profile Settings</h3>
          <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h3>Staff Security Settings</h3>
            <p className="text-sm text-muted mt-xs">Update your credentials for the support staff portal.</p>

            {settingsSuccess && (
              <div className="badge badge-success mt-md" style={{ width: '100%', padding: '10px', justifyContent: 'center' }}>
                {settingsSuccess}
              </div>
            )}
            {settingsError && (
              <div className="badge badge-error mt-md" style={{ width: '100%', padding: '10px', justifyContent: 'center' }}>
                {settingsError}
              </div>
            )}

            <form onSubmit={handleSettingsSubmit} className="mt-md" id="employee-settings-form">
              <div className="form-group">
                <label htmlFor="set-emp-user">Username</label>
                <input 
                  type="text" 
                  id="set-emp-user" 
                  className="form-control" 
                  required
                  value={settingsForm.username}
                  onChange={(e) => setSettingsForm({...settingsForm, username: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label htmlFor="set-emp-pass">New Password</label>
                <input 
                  type="password" 
                  id="set-emp-pass" 
                  className="form-control" 
                  placeholder="Enter new password"
                  required
                  value={settingsForm.password}
                  onChange={(e) => setSettingsForm({...settingsForm, password: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label htmlFor="set-emp-pass-confirm">Confirm Password</label>
                <input 
                  type="password" 
                  id="set-emp-pass-confirm" 
                  className="form-control" 
                  placeholder="Repeat new password"
                  required
                  value={settingsForm.confirmPassword}
                  onChange={(e) => setSettingsForm({...settingsForm, confirmPassword: e.target.value})}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Update Credentials
              </button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
