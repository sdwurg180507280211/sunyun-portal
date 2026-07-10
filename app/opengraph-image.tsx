import {ImageResponse} from "next/og";
import {brand} from "@/lib/brand";

export const alt = `${brand.shortName}｜${brand.tagline}`;
export const size = {width: 1200, height: 630};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "72px 82px",
        color: "#10233F",
        background: "linear-gradient(135deg,#FFFFFF 0%,#F3F6FA 58%,#DCE7F4 100%)",
      }}
    >
      <div style={{display: "flex", maxWidth: 720, flexDirection: "column"}}>
        <div style={{fontSize: 24, color: "#1758D5", letterSpacing: 3}}>{brand.englishName}</div>
        <div style={{marginTop: 28, fontSize: 72, fontWeight: 750, lineHeight: 1.08}}>{brand.tagline}</div>
        <div style={{marginTop: 28, fontSize: 28, color: "#5B7088"}}>{brand.description}</div>
      </div>
      <div
        style={{
          display: "flex",
          height: 300,
          width: 300,
          alignItems: "center",
          justifyContent: "center",
          clipPath: "polygon(50% 0%,96% 28%,82% 88%,53% 100%,11% 84%,0% 27%)",
          color: "white",
          background: "linear-gradient(145deg,#D8F3FF,#4E83EC 42%,#C5CEE0 70%,#7057E8)",
          fontSize: 110,
          fontWeight: 800,
        }}
      >
        云
      </div>
    </div>,
    size,
  );
}
