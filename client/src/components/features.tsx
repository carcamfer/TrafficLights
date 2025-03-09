import { Card, CardContent } from "@/components/ui/card";
import { Zap, Shield, LineChart } from "lucide-react";

const features = [
  {
    title: "Lightning Fast",
    description: "Experience blazing fast performance with our optimized platform",
    icon: Zap,
    image: "https://images.unsplash.com/photo-1506729623306-b5a934d88b53",
  },
  {
    title: "Secure by Design",
    description: "Your data is protected with enterprise-grade security",
    icon: Shield,
    image: "https://images.unsplash.com/photo-1559273514-468728ffc16c",
  },
  {
    title: "Data Analytics",
    description: "Make informed decisions with powerful analytics tools",
    icon: LineChart,
    image: "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4",
  },
];

export default function Features() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose Us</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover the features that make our platform stand out from the competition
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
