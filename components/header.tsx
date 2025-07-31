import { SignedOut,SignInButton,SignedIn,UserButton } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"
import { Button } from "./ui/button"
import { LayoutDashboard } from "lucide-react"
import { checkUser } from "@/lib/checkUser"
const header=async ()=> {
  await checkUser();
  return (
    <div className="fixed top-0 w-full bg-gradient-to-b from-[#0079fa] to-[#043efa] backdrop-blur-md z-50 border-b">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" >
        <Image src={"/logo-light.jpeg"} alt="pennie logo" width={200} height={100} className="h-16 w-auto object-contain mix-blend-lighten opacity-90"/>
        </Link>
        <div className="flex items-center space-x-4">
          <SignedIn>
            <Link href={"/dashboard"} className="group">
              <Button 
                variant={"outline"} 
                className="transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 group-hover:shadow-blue-300/50"
              >
                <LayoutDashboard 
                  size={"18"} 
                  className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" 
                />
                <span className="hidden md:inline transition-all duration-300 group-hover:font-semibold">Dashboard</span>
              </Button>
            </Link>
            <Link href={"/transaction/create"} className="group">
              <Button className="flex items-center gap-2 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:shadow-blue-400/30 relative overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></span>
                <LayoutDashboard 
                  size={"18"} 
                  className="transition-all duration-300 group-hover:rotate-180 group-hover:scale-110 relative z-10" 
                />
                <span className="hidden md:inline transition-all duration-300 group-hover:font-bold relative z-10">Add Transaction</span>
              </Button>
            </Link>
          </SignedIn>
          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button variant="outline">Login</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
              <UserButton appearance={{
                elements:{
                  avatarBox: "w-15 h-15",
                },
              }}
              />
          </SignedIn>
        </div>
      </nav>
    </div>
  )
}

export default header