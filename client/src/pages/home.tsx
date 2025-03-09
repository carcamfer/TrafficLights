import Hero from "@/components/hero";
import WaitlistForm from "@/components/waitlist-form";

export default function Home() {
  return (
    <div className="min-h-screen">
      <main>
        <Hero />
        <section className="py-16 px-4 bg-muted/50">
          <div className="container mx-auto max-w-lg text-center">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Join the Waitlist
            </h2>
            <p className="text-muted-foreground mb-8">
              Be the first to know when we launch. Early access for waitlist members.
            </p>
            <WaitlistForm />
          </div>
        </section>
      </main>
    </div>
  );
}