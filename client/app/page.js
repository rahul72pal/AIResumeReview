"use client";
import { WavyBackground } from "@/components/ui/wavy-background";
import Link from "next/link";
import { Typewriter } from "react-simple-typewriter";

export default function Home() {
  return (
    <WavyBackground className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-32">
      <div>
        <p className="text-xl sm:text-2xl md:text-3xl lg:text-5xl text-white font-bold inter-var text-center leading-snug">
          <Typewriter
            words={[
              "Optimize Your Resume for ATS Success 🚀📄",
              "Unlock Your Interview Potential with AI 🔓🤖",
              "Score Higher, Get Noticed by Recruiters ⭐📈",
              "Tailor Your Resume for Every Job Opportunity 🎯📝"
            ]}
            loop={0}
            cursor
            cursorStyle="|"
            typeSpeed={70}
            deleteSpeed={30}
            delaySpeed={2500}
          />
        </p>
        <p className="text-sm sm:text-base md:text-lg mt-4 text-white font-normal inter-var text-center max-w-2xl mx-auto">
          Get an instant ATS score 📊 and actionable feedback 🤖 from our
          AI-powered resume review to boost your chances of landing interviews 🎯.
        </p>
      </div>

      <div className="text-center mt-8 sm:mt-10">
        <Link href="/resume">
          <div className="p-[2px] sm:p-[3px] relative inline-block cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-800 rounded-lg" />
            <div className="px-6 sm:px-8 py-2 bg-black rounded-[6px] relative group transition duration-200 text-white hover:bg-transparent text-sm sm:text-base">
              Check Your Resume
            </div>
          </div>
        </Link>
      </div>
    </WavyBackground>
  );
}
