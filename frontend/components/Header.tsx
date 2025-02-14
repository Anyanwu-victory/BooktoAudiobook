import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "./ui/button";
import { FilePlus } from "lucide-react";


function Header() {
  return (
    <div className="flex justify-between bg-white shadow-sm p-5 border-b">
      {/* Branding */}
      <Link href={"/dashboard"} className="text-2xl">
        <span className="text-gray-800 uppercase font-bold">Voxa</span> 
      </Link>

      {/* Signed-in user actions */}
     
        <div className="flex items-center space-x-2">
          <Button asChild variant={"outline"} className="hidden md:flex">
            <Link href={"/dashboard"}>My Documents</Link>
          </Button>
          <Button asChild variant={"outline"} className="hidden md:flex">
            <Link href={"/dashboard/upload"}>
              <FilePlus />
              <span>Upload</span>
            </Link>
          </Button>

          <UserButton />
        </div>
     
    </div>
  );
}

export default Header;
