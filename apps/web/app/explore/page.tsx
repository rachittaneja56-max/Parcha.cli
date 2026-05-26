"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";
import { Navbar } from "~/components/landing/Navbar";
import { Footer } from "~/components/landing/Footer";
import { ExploreHero } from "~/components/explore/ExploreHero";
import { StarterTemplates, type StarterTemplate } from "~/components/explore/StarterTemplates";
import { CommunityRegistry } from "~/components/explore/CommunityRegistry";
import { usePublicForms } from "~/hooks/usePublicForms";

export default function ExplorePage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All Blueprints");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTemplateIdx, setActiveTemplateIdx] = useState<number | null>(null);

  const { data: sessionData, isLoading: sessionLoading } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 0,
  });

  const { data: forms, isLoading, isError } = usePublicForms();

  const createFormMutation = trpc.form.create.useMutation({
    onSuccess: (newForm) => {
      toast.success("Template cloned successfully! Opening builder...");
      if (newForm?.id) {
        router.push(`/dashboard/builder/${newForm.id}`);
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create form from template.");
      setActiveTemplateIdx(null);
    },
  });

  const handleUseTemplate = (template: StarterTemplate, index: number) => {
    if (!sessionData?.user) {
      toast.error("Please sign in to clone this starter template.");
      router.push(`/auth/login?redirect=/explore`);
      return;
    }

    setActiveTemplateIdx(index);
    createFormMutation.mutate({
      title: template.title,
      theme: template.theme,
      schema: template.schema,
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-zinc-800 selection:text-white">
      <Navbar
        sessionData={sessionData}
        sessionLoading={sessionLoading}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main className="mx-auto max-w-7xl px-6 pt-32 pb-32">
        <ExploreHero />

        <StarterTemplates
          onUseTemplate={handleUseTemplate}
          isMutationPending={createFormMutation.isPending}
          activeTemplateIdx={activeTemplateIdx}
        />

        <CommunityRegistry
          forms={forms}
          isLoading={isLoading}
          isError={isError}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
      </main>

      <Footer />
    </div>
  );
}
