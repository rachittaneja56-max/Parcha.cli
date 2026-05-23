import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

export function Pricing() {
  const plans = [
    {
      name: "Hobby",
      price: "$0",
      description: "For individuals exploring the platform.",
      features: ["Basic forms", "Standard themes", "100 submissions/mo", "Community support"],
      buttonText: "Start for free",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$15",
      period: "/mo",
      description: "For professionals who need more power.",
      features: ["Unlimited forms", "Advanced logic", "Remove Parcha branding", "10,000 submissions/mo", "Email support"],
      buttonText: "Upgrade to Pro",
      highlighted: false,
    },
    {
      name: "Infrastructure",
      price: "$49",
      period: "/mo",
      description: "For developers building custom apps.",
      features: ["API Access", "Webhooks", "Custom CLI themes", "Database sync", "Unlimited submissions", "Priority support"],
      buttonText: "Get Infrastructure",
      highlighted: true,
    }
  ];

  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-4 text-zinc-400">Start building for free, then upgrade when you need more power.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`flex flex-col p-8 bg-zinc-900/30 ${
                plan.highlighted 
                  ? "border-zinc-600 relative shadow-2xl shadow-zinc-900/50" 
                  : "border-zinc-800"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-0 right-0 flex justify-center">
                  <span className="bg-zinc-200 text-zinc-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                <p className="text-sm text-zinc-400 mt-2">{plan.description}</p>
              </div>
              
              <div className="mb-6 flex items-baseline text-white">
                <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                {plan.period && <span className="text-zinc-400 ml-1 font-medium">{plan.period}</span>}
              </div>
              
              <ul className="mb-8 flex-1 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-5 w-5 text-zinc-300 shrink-0 mr-3" />
                    <span className="text-sm text-zinc-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                asChild
                className={`w-full mt-auto ${
                  plan.highlighted 
                    ? "bg-white text-black hover:bg-zinc-200 font-medium" 
                    : "bg-zinc-800 text-white hover:bg-zinc-700"
                }`}
              >
                <Link href="/auth/register">{plan.buttonText}</Link>
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
