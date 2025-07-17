import { currentUser } from "@clerk/nextjs/server"
import { db } from "./prisma";
import type {User as ClerkUser}  from "@clerk/nextjs/server";
import type { User } from "@prisma/client";
export const checkUser=async(): Promise<User|null>=>{
    const user= await currentUser();
    if(!user){
        return null;
    }
    try{
        const loggedInUser=await db.user.findUnique({
            where:{
                clerkUserId:user.id,
            },
        })
        if(loggedInUser){
            return loggedInUser;
        }const name=`${user.firstName} ${user.lastName ?? ""}`.trim();
        const newUser=await db.user.create({
            data:{
                clerkUserId:user.id,
                name,
                imageUrl:user.imageUrl,
                email: user.emailAddresses[0].emailAddress,
            },
        });
        return newUser;
    } catch(error:any){
        console.log(error.message);
        return null;
    }
}