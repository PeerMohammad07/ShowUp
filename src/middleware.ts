import { auth } from "@/auth"

export default auth((req) => {
  // Add any additional middleware logic here if needed
})

export const config = {
  matcher: ["/dashboard/:path*"],
}
