"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import { useEffect, useRef } from "react";

const HeroSection = () => {
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = imageRef.current;
    const imageDiv = wrapper?.querySelector(".hero-image") as HTMLElement;

    const handleScroll = () => {
      if (!imageDiv) return;

      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (scrollPosition > scrollThreshold) {
        imageDiv.classList.add("hero-image-scrolled");
      } else {
        imageDiv.classList.remove("hero-image-scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="pb-20 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl md:text-8xl lg:text-[105px] pb-6 gradient-title">
          Track your finances <br />
          with intelligence
        </h1>
        <p className="text-gray-600 text-xl mb-8 max-w-2xl mx-auto">
          An AI-powered financial assistant that helps you track your finances,
          get insights into your spending, and make smarter financial decisions.
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/dashboard" className="group">
            <Button 
              size="lg" 
              className="px-8 transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-xl hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:shadow-blue-400/40 relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></span>
              <span className="relative z-10 transition-all duration-300 group-hover:font-bold">Get Started</span>
            </Button>
          </Link>
          <Link href="/demo-video" className="group">
            <Button 
              size="lg" 
              className="px-8 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 group-hover:shadow-blue-300/50" 
              variant="outline"
            >
              <span className="transition-all duration-300 group-hover:font-semibold">Watch Demo</span>
            </Button>
          </Link>
        </div>

        <div className="hero-image-wrapper mt-12 overflow-x-hidden" ref={imageRef}>
          <div className="hero-image">
            <Image
              src="/banner.jpg"
              alt="Dashboard preview"
              width={1280}
              height={620}
              className="rounded-lg shadow-2xl border mx-auto"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;