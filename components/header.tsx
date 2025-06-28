import { SignedOut,SignIn,SignInButton,SignUpButton,SignedIn,UserButton } from "@clerk/nextjs"
const header=()=> {
  return (
    <div className="fixed top-0">
        <SignedOut>
            <SignInButton />

        </SignedOut>
        <SignedIn>
            <UserButton />
        </SignedIn>
    </div>
  )
}

export default header