// components/Avatar.jsx
const Avatar = ({ name, src, size = 48, borderColor, className = "" }) => {
  const bg = borderColor ? "1e3a5f" : "f3f2ff";
  const color = borderColor ? "ffffff" : "5174f3";
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name ?? "?")}&size=${size}&background=${bg}&color=${color}`;

  return (
    <Image
      src={src || fallback}
      roundedCircle
      alt={name}
      width={size}
      height={size}
      className={className}
      style={{ objectFit: "cover" }}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = fallback;
      }}
    />
  );
};

export default Avatar;