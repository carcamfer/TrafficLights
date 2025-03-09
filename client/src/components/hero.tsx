import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import WaitlistForm from "@/components/waitlist-form";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-background pt-16 md:pt-20 lg:pt-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Join Our{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Exclusive Waitlist
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Be the first to experience our revolutionary platform when we launch.
          </p>
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}