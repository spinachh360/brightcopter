import { useId } from "react";
import type { Product } from "./data";

export default function ProductVisual({
  kind = "fan",
  finish = "Pearl white",
  hero = false,
}: {
  kind?: Product["kind"];
  finish?: string;
  hero?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const brown = finish === "Earth brown";
  const silver = finish === "Silver";
  const light = brown ? "#a8876e" : silver ? "#f0f2f2" : "#fffef7";
  const mid = brown ? "#755640" : silver ? "#b9c1c4" : "#e6e2d7";
  const dark = brown ? "#463229" : silver ? "#78838a" : "#c6bfae";
  const id = (name: string) => `${uid}-${name}`;
  const fill = (name: string) => `url(#${id(name)})`;
  return (
    <svg
      className={`product-visual ${hero ? "hero-fan" : ""}`}
      viewBox="0 0 640 440"
      role="img"
      aria-label={`Illustrative ${finish.toLowerCase()} ${kind === "fan" ? "ceiling fan" : kind === "mixer" ? "mixer grinder" : kind === "heater" ? "water heater" : "LED light"}`}
    >
      <defs>
        <linearGradient id={id("blade")} x1="0" y1="0" x2=".6" y2="1">
          <stop stopColor={light} />
          <stop offset=".42" stopColor={mid} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <linearGradient id={id("body")} x1="0" x2="1" y2=".6">
          <stop stopColor={dark} />
          <stop offset=".3" stopColor={light} />
          <stop offset=".7" stopColor={mid} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <linearGradient id={id("metal")}>
          <stop stopColor="#8d969b" />
          <stop offset=".35" stopColor="#fafcfb" />
          <stop offset=".6" stopColor="#b8bfc0" />
          <stop offset="1" stopColor="#737e83" />
        </linearGradient>
        <linearGradient id={id("white")} x2="1" y2=".4">
          <stop stopColor="#ffffff" />
          <stop offset=".6" stopColor="#ecece8" />
          <stop offset="1" stopColor="#c8ccc9" />
        </linearGradient>
        <filter id={id("shadow")} x="-50%" y="-50%" width="200%" height="220%">
          <feDropShadow
            dx="4"
            dy="20"
            stdDeviation="13"
            floodColor="#44281a"
            floodOpacity=".19"
          />
        </filter>
        <filter id={id("blur")}>
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>
      {kind === "fan" ? (
        <>
          <ellipse
            cx="330"
            cy="366"
            rx="178"
            ry="18"
            fill="#4d3d33"
            opacity=".1"
            filter={fill("blur")}
          />
          <g
            transform={
              hero
                ? "translate(0 -5) rotate(-12 320 225)"
                : "translate(0 0) rotate(-10 320 225)"
            }
            filter={fill("shadow")}
          >
            <path d="M312 93 L328 93 L328 217 L312 217 Z" fill={fill("body")} />
            <path
              d="M283 97 Q286 66 320 64 Q354 66 357 97 Q323 109 283 97Z"
              fill={fill("blade")}
            />
            <ellipse cx="320" cy="98" rx="37" ry="8" fill={mid} />
            <g transform="translate(0 36) translate(320 210) scale(1 .75) translate(-320 -210)">
              {[0, 120, 240].map((angle) => (
                <g key={angle} transform={`rotate(${angle} 320 210)`}>
                  <path
                    d="M305 207 C270 187 244 151 191 126 C147 104 88 88 60 106 C40 120 55 145 82 163 C141 202 221 228 299 235 Z"
                    fill={dark}
                    transform="translate(0 5)"
                  />
                  <path
                    d="M305 207 C270 187 244 151 191 126 C147 104 88 88 60 106 C40 120 55 145 82 163 C141 202 221 228 299 235 Z"
                    fill={fill("blade")}
                  />
                  <path
                    d="M290 212 C227 188 133 125 74 116"
                    stroke={light}
                    strokeWidth="1.4"
                    fill="none"
                    opacity=".6"
                  />
                </g>
              ))}
              <ellipse cx="320" cy="220" rx="56" ry="48" fill={dark} />
              <ellipse cx="320" cy="211" rx="57" ry="48" fill={fill("body")} />
              <ellipse
                cx="320"
                cy="205"
                rx="47"
                ry="39"
                fill={fill("blade")}
                stroke={light}
                strokeOpacity=".6"
              />
              <ellipse cx="320" cy="205" rx="32" ry="27" fill={fill("body")} />
              <ellipse
                cx="320"
                cy="201"
                rx="14"
                ry="11"
                fill={light}
                opacity=".65"
              />
              <path
                d="M287 238 Q320 250 353 238"
                stroke={light}
                opacity=".6"
                strokeWidth="2"
                fill="none"
              />
            </g>
          </g>
        </>
      ) : kind === "mixer" ? (
        <g filter={fill("shadow")}>
          <ellipse
            cx="316"
            cy="365"
            rx="120"
            ry="12"
            fill="#302f2a"
            opacity=".1"
          />
          <path
            d="M236 228 Q320 209 385 230 L408 342 Q322 369 214 342Z"
            fill={fill("white")}
          />
          <path
            d="M214 342 Q313 365 408 342 L404 355 Q310 378 218 355Z"
            fill="#bd142c"
          />
          <path
            d="M251 122 L369 122 L354 238 Q320 254 267 238Z"
            fill={fill("metal")}
          />
          <ellipse cx="310" cy="122" rx="59" ry="13" fill="#40484a" />
          <path
            d="M247 118 Q308 102 373 118 L370 133 Q309 120 251 134Z"
            fill="#42454a"
          />
          <path
            d="M365 145 Q421 139 412 193 Q408 217 362 211"
            stroke="#343b3e"
            fill="none"
            strokeWidth="15"
          />
          <circle cx="310" cy="301" r="22" fill="#d61e34" />
          <path
            d="M310 286 V300"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M268 264 Q312 270 354 264"
            stroke="#cdd0ca"
            strokeWidth="2"
            fill="none"
          />
        </g>
      ) : kind === "heater" ? (
        <g filter={fill("shadow")}>
          <ellipse
            cx="320"
            cy="372"
            rx="99"
            ry="12"
            fill="#252427"
            opacity=".1"
          />
          <rect
            x="229"
            y="83"
            width="183"
            height="265"
            rx="66"
            fill={fill("white")}
          />
          <path
            d="M238 293 Q320 316 402 293 L397 324 Q320 357 246 325Z"
            fill="#d71d32"
          />
          <rect x="290" y="179" width="60" height="57" rx="18" fill="#dadeda" />
          <circle cx="320" cy="208" r="16" fill="#5d6665" />
          <path d="M320 196 L326 206" stroke="#fff" strokeWidth="2" />
          <path
            d="M280 346 V367 M361 346 V367"
            stroke="#8d9495"
            strokeWidth="13"
          />
          <path
            d="M259 115 Q311 91 376 115"
            stroke="#fff"
            strokeWidth="6"
            fill="none"
            opacity=".7"
          />
        </g>
      ) : (
        <g filter={fill("shadow")} transform="rotate(-22 320 220)">
          <rect
            x="81"
            y="198"
            width="479"
            height="49"
            rx="24"
            fill={fill("metal")}
          />
          <rect
            x="93"
            y="196"
            width="455"
            height="41"
            rx="20"
            fill={fill("white")}
          />
          <rect x="83" y="201" width="18" height="39" rx="6" fill="#b0b5b5" />
          <rect x="539" y="201" width="18" height="39" rx="6" fill="#b0b5b5" />
          <path
            d="M114 206 H522"
            stroke="#fff"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  );
}
