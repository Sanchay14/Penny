import { SignedOut,SignIn,SignInButton,SignUpButton,SignedIn,UserButton } from "@clerk/nextjs"
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
            <Link href={"/dashboard"} className="text-gray-600 hover:text-blue-600 flex items-center gap-2">
              <Button variant={"outline"}>
                <LayoutDashboard size={"18"}/>
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>
            <Link href={"/transaction/create"}>
              <Button className="flex items-center gap-2">
                <LayoutDashboard size={"18"}/>
                <span className="hidden md:inline">Add Transaction</span>
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