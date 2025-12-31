import { FaviconLogo } from "@/components/brand";
import { ImageResponse } from "next/og";

export const size = {
    width: 32,
    height: 32,
};
export const contentType = "image/png";

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 24,
                    background: "#00D261",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    borderRadius: "8px",
                }}
            >
                {/* Simplified Checkmark for Favicon */}
                <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                    <path d="M6 16L13 23L26 9" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        ),
        {
            ...size,
        }
    );
}
