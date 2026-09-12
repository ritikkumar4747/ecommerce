import { useEffect, useState, useContext } from 'react';
import Api from '../services/Api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/Authcontext';

export default function Profile(){
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({ recipientName: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: '', phone: '', label: '', isDefault: false });
  const [editingId, setEditingId] = useState(null);
  const [addressErrors, setAddressErrors] = useState({});

  useEffect(()=>{
    Api.get('/auth/me')
      .then(res=>{ setProfile(res.data); setLoading(false); })
      .catch(()=>{ navigate('/login'); });
    Api.get('/addresses').then(r=>setAddresses(r.data)).catch(()=>{});
  },[navigate]);

  const makeAdmin = async ()=>{
    try{
      const res = await Api.post('/auth/make-admin');
      setProfile(prev=>({...prev, role: res.data.role}));
      setUser(prev=>({...prev, role: res.data.role}));
      alert('You are now admin');
    }catch{ alert('Failed to promote'); }
  }

  if(loading) return <div className="pt-32 text-center text-white bg-zinc-950 min-h-screen">Loading profile...</div>;

  return (
    <div className="max-w-md mx-auto p-6 pt-28 min-h-screen pb-12 text-white">
      <h2 className="text-3xl font-light tracking-[0.25em] mb-10 text-center">MY PROFILE</h2>
      
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 space-y-6 shadow-xl relative">
        {/* Profile Details */}
        <div className="space-y-4">
          <div className="border-b border-zinc-800 pb-3">
            <span className="text-xs text-zinc-500 uppercase tracking-widest block mb-1">Full Name</span>
            <span className="text-lg font-light text-zinc-100">{profile.name}</span>
          </div>

          <div className="border-b border-zinc-800 pb-3">
            <span className="text-xs text-zinc-500 uppercase tracking-widest block mb-1">Email Address</span>
            <span className="text-zinc-100 font-light">{profile.email}</span>
          </div>

          <div className="pb-2">
            <span className="text-xs text-zinc-500 uppercase tracking-widest block mb-1">Account Role</span>
            <span className="text-sm font-semibold text-white uppercase tracking-wider bg-zinc-800 px-3 py-1 rounded-md border border-zinc-700/50 inline-block">
              {profile.role}
            </span>
          </div>
        </div>

        {/* Promote to Admin button */}
        {profile.role !== 'admin' && (
          <div className="pt-4 border-t border-zinc-800">
            <p className="text-xs text-zinc-400 mb-3 italic">For testing purposes, you can promote this account to administrator.</p>
            <button onClick={makeAdmin} className="w-full py-3 bg-white text-black font-semibold text-xs tracking-widest hover:bg-zinc-200 transition rounded-lg cursor-pointer">
              PROMOTE TO ADMIN
            </button>
          </div>
        )}
      </div>
      {/* Addresses */}
      <div className="max-w-md mx-auto p-6 mt-8 text-white">
        <h3 className="text-xl mb-4">Saved Addresses</h3>

        <div className="space-y-3">
          {addresses.length === 0 && <div className="text-sm text-gray-400">No saved addresses.</div>}
          {addresses.map(a=> (
            <div key={a._id} className="bg-zinc-900/40 p-3 rounded-md border border-zinc-800 flex justify-between items-start">
              <div>
                <div className="font-medium">{a.label || 'Address' } {a.isDefault && <span className="text-xs ml-2 bg-white text-black px-2 rounded">Default</span>}</div>
                <div className="text-sm text-zinc-300">{a.recipientName} — {a.line1}{a.line2?(', '+a.line2):''}, {a.city} {a.postalCode}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={async ()=>{ try{ await Api.delete('/addresses/'+a._id); setAddresses(prev=>prev.filter(x=>x._id!==a._id)); }catch{alert('Delete failed');}}} className="text-xs px-3 py-1 bg-rose-600 rounded">Delete</button>
                <button onClick={()=>{ setEditingId(a._id); setNewAddress({ recipientName: a.recipientName||'', line1: a.line1||'', line2: a.line2||'', city: a.city||'', state: a.state||'', postalCode: a.postalCode||'', country: a.country||'', phone: a.phone||'', label: a.label||'', isDefault: a.isDefault||false }); }} className="text-xs px-3 py-1 bg-zinc-700 rounded">Edit</button>
              </div>
            </div>
          ))}
        </div>

        <h4 className="text-lg mt-6 mb-3">Add Address</h4>
            <div className="space-y-2">
          <label className="sr-only" htmlFor="recipientName">Recipient name</label>
          <input id="recipientName" aria-required="true" aria-invalid={!!addressErrors.recipientName} value={newAddress.recipientName} onChange={e=>{ setNewAddress({...newAddress, recipientName:e.target.value}); setAddressErrors(prev=>({ ...prev, recipientName: '' })); }} placeholder="Recipient name" className="w-full p-2 bg-zinc-900/30 rounded" />
          {addressErrors.recipientName && <div role="alert" className="text-rose-400 text-sm">{addressErrors.recipientName}</div>}

          <label className="sr-only" htmlFor="line1">Address line 1</label>
          <input id="line1" aria-required="true" aria-invalid={!!addressErrors.line1} value={newAddress.line1} onChange={e=>{ setNewAddress({...newAddress, line1:e.target.value}); setAddressErrors(prev=>({ ...prev, line1: '' })); }} placeholder="Address line 1" className="w-full p-2 bg-zinc-900/30 rounded" />
          {addressErrors.line1 && <div role="alert" className="text-rose-400 text-sm">{addressErrors.line1}</div>}

          <label className="sr-only" htmlFor="line2">Address line 2</label>
          <input id="line2" value={newAddress.line2} onChange={e=>setNewAddress({...newAddress, line2:e.target.value})} placeholder="Address line 2" className="w-full p-2 bg-zinc-900/30 rounded" />

          <div className="grid grid-cols-3 gap-2">
            <label className="sr-only" htmlFor="city">City</label>
            <input id="city" aria-required="true" aria-invalid={!!addressErrors.city} value={newAddress.city} onChange={e=>{ setNewAddress({...newAddress, city:e.target.value}); setAddressErrors(prev=>({ ...prev, city: '' })); }} placeholder="City" className="p-2 bg-zinc-900/30 rounded" />
            {addressErrors.city && <div role="alert" className="text-rose-400 text-sm col-span-3">{addressErrors.city}</div>}

            <label className="sr-only" htmlFor="postalCode">Postal code</label>
            <input id="postalCode" aria-required="true" aria-invalid={!!addressErrors.postalCode} value={newAddress.postalCode} onChange={e=>{ setNewAddress({...newAddress, postalCode:e.target.value}); setAddressErrors(prev=>({ ...prev, postalCode: '' })); }} placeholder="Postal code" className="p-2 bg-zinc-900/30 rounded" />
            {addressErrors.postalCode && <div role="alert" className="text-rose-400 text-sm col-span-3">{addressErrors.postalCode}</div>}

            <label className="sr-only" htmlFor="country">Country</label>
            <input id="country" aria-required="true" aria-invalid={!!addressErrors.country} value={newAddress.country} onChange={e=>{ setNewAddress({...newAddress, country:e.target.value}); setAddressErrors(prev=>({ ...prev, country: '' })); }} placeholder="Country" className="p-2 bg-zinc-900/30 rounded" />
            {addressErrors.country && <div role="alert" className="text-rose-400 text-sm col-span-3">{addressErrors.country}</div>}
          </div>

          <input id="phone" aria-required="true" aria-invalid={!!addressErrors.phone} value={newAddress.phone} onChange={e=>{ setNewAddress({...newAddress, phone:e.target.value}); setAddressErrors(prev=>({ ...prev, phone: '' })); }} placeholder="Phone number" className="w-full p-2 bg-zinc-900/30 rounded" />
          {addressErrors.phone && <div role="alert" className="text-rose-400 text-sm">{addressErrors.phone}</div>}

          <div className="flex gap-2 items-center">
            <input type="checkbox" checked={newAddress.isDefault} onChange={e=>setNewAddress({...newAddress, isDefault: e.target.checked})} /> <span className="text-sm text-gray-400">Set as default</span>
          </div>
          <div className="flex gap-2">
            <button onClick={async ()=>{
              // client-side validation
              const required = ["recipientName","line1","city","postalCode","country"];
              const errs = {};
              required.forEach(f=>{ if(!newAddress[f] || String(newAddress[f]).trim()==='') errs[f] = 'This field is required' });
              if(Object.keys(errs).length>0){ setAddressErrors(errs); return }
              try{
                if(editingId){
                  const res = await Api.put('/addresses/'+editingId, newAddress);
                  setAddresses(prev=>prev.map(a=> a._id===editingId?res.data:a));
                  setEditingId(null);
                } else {
                  const res = await Api.post('/addresses', newAddress);
                  setAddresses(prev=>[...prev, res.data]);
                }
                setNewAddress({ recipientName: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: '', phone: '', label: '', isDefault: false });
                setAddressErrors({});
              }catch{ alert('Save failed'); }
            }} className="py-2 px-4 bg-white text-black rounded">{editingId? 'Save Address' : 'Add Address'}</button>

            {editingId && <button onClick={()=>{ setEditingId(null); setNewAddress({ recipientName: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: '', phone: '', label: '', isDefault: false }); setAddressErrors({}); }} className="py-2 px-4 bg-zinc-800 text-white rounded">Cancel</button>}
          </div>
        </div>
      </div>
    </div>
  )
}
