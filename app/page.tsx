import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  featuresData,
  howItWorksData,
  userBenefitsData,
  techStackData,
} from "@/data/landing";
import HeroSection from "@/components/hero";
import Link from "next/link";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="pt-30">
        <HeroSection />
      </div>



      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to manage your finances
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card className="group p-6 hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-105 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 hover:border-blue-300" key={index}>
                  <CardContent className="space-y-4 pt-4">
                    <Icon className="h-8 w-8 text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-700 group-hover:rotate-12" />
                    <h3 className="text-xl font-semibold transition-all duration-300 group-hover:text-blue-800 group-hover:font-bold">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 text-center sm:text-left leading-relaxed transition-all duration-300 group-hover:text-blue-700">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {howItWorksData.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="group text-center hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300 group-hover:bg-blue-200 group-hover:scale-110 group-hover:shadow-lg">
                    <Icon className="h-8 w-8 text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-700 group-hover:rotate-12" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 transition-all duration-300 group-hover:text-blue-800 group-hover:font-bold">{step.title}</h3>
                  <p className="text-gray-600 transition-all duration-300 group-hover:text-blue-700">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What Users Will Love Section (replaces fake testimonials) */}
      <section id="benefits" className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12 sm:mb-16">
            What You&apos;ll Love About Penyy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {userBenefitsData.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
              <Card key={index} className="group p-4 sm:p-6 hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-105 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 hover:border-blue-300">
                <CardContent className="pt-4 text-center">
                  <div className="flex justify-center mb-3 sm:mb-4">
                  <Icon className="h-8 w-8 text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-700 group-hover:rotate-12" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 transition-all duration-300 group-hover:text-blue-800 group-hover:font-bold">
                    {benefit.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed transition-all duration-300 group-hover:text-blue-700">
                    {benefit.description}
                  </p>
                  <div className="text-xs sm:text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block transition-all duration-300 group-hover:bg-blue-200 group-hover:scale-105 group-hover:font-bold">
                    {benefit.benefit}
                  </div>
                </CardContent>
              </Card>
            )})}
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-800">
            Built with Modern Technology
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {techStackData.map((tech, index) => (
              <div key={index} className="text-center p-3 sm:p-4">
                <div className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-1">
                  {tech.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">{tech.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-16 md:py-20 bg-blue-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Start managing your finances smarter with AI-powered insights and automated tracking
          </p>
          <Link href="/dashboard" className="group">
          <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 transition-all duration-300 ease-in-out text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 hover:scale-110 hover:shadow-xl hover:shadow-white/30 relative overflow-hidden group-hover:shadow-2xl"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></span>
              <span className="relative z-10 transition-all duration-300 group-hover:font-bold">Start Free Trial</span>
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;