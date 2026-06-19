export default function Input({ label, ...props }) {
  return (
    <div>
      {label && <label style={s.label}>{label}</label>}
      <input style={s.input} {...props} />
    </div>
  )
}

const s = {
  label: { display: 'block', fontSize: 16, fontWeight: '500', color: '#252525', marginBottom: 5, marginTop: 10, textAlign: 'left' },
  input: {
    display: 'block', width: '100%',
    border: '1px solid #3c3c3c', borderRadius: 5,
    padding: '10px', fontSize: 12, marginBottom: 10,
    color: '#3c3c3c', background: '#fbfbfb', boxSizing: 'border-box',
  },
}
