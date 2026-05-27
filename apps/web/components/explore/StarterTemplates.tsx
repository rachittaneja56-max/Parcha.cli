import {
  Mail,
  Users,
  Calendar,
  Smile,
  Briefcase,
  LayoutTemplate,
  ChevronRight,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { ThemeBadge } from "./ThemeBadge";

export const STARTER_TEMPLATES = [
  {
    title: "Contact Us Form",
    description:
      "The most basic and necessary form. Requires standard input fields like Name, Email, and a multi-line text box for messages.",
    iconName: "Mail" as const,
    theme: "standard" as const,
    schema: [
      {
        id: "fld_contact_name",
        type: "short_text",
        name: "name",
        prompt: "What is your name?",
        required: true,
      },
      {
        id: "fld_contact_email",
        type: "email",
        name: "email",
        prompt: "What is your email address?",
        required: true,
      },
      {
        id: "fld_contact_message",
        type: "long_text",
        name: "message",
        prompt: "How can we help you today?",
        required: true,
      },
    ],
  },
  {
    title: "Lead Generation/Newsletter Form",
    description:
      "Captures emails for marketing. Designed with multi-step progressive profiling in mind to improve conversion rates.",
    iconName: "Users" as const,
    theme: "standard" as const,
    schema: [
      {
        id: "fld_lead_email",
        type: "email",
        name: "email",
        prompt: "Enter your professional email address to join the waitlist",
        required: true,
        page_number: 1,
      },
      {
        id: "fld_lead_name",
        type: "short_text",
        name: "fullName",
        prompt: "What is your full name?",
        required: true,
        page_number: 2,
      },
      {
        id: "fld_lead_role",
        type: "single_select",
        name: "role",
        prompt: "What best describes your current role?",
        required: false,
        options: ["Developer", "Designer", "Product Manager", "Founder / Exec", "Other"],
        page_number: 2,
      },
    ],
  },
  {
    title: "Event Registration Form",
    description:
      "Ideal for webinars or meetups. Features date pickers and dropdowns for ticket types.",
    iconName: "Calendar" as const,
    theme: "standard" as const,
    schema: [
      {
        id: "fld_event_name",
        type: "short_text",
        name: "fullName",
        prompt: "Your Full Name",
        required: true,
      },
      {
        id: "fld_event_email",
        type: "email",
        name: "email",
        prompt: "Email Address",
        required: true,
      },
      {
        id: "fld_event_date",
        type: "date",
        name: "preferredDate",
        prompt: "Which event session would you like to attend?",
        required: true,
      },
      {
        id: "fld_event_ticket",
        type: "single_select",
        name: "ticketType",
        prompt: "Select your ticket tier",
        required: true,
        options: [
          "General Admission - Free",
          "VIP Access Pass - $99",
          "All-Access Dev Pass - $149",
        ],
      },
    ],
  },
  {
    title: "Customer Feedback/Satisfaction Survey",
    description:
      "Collects NPS (Net Promoter Score) or general ratings. Incorporates scale/rating fields and conditional logic to redirect users based on their scores.",
    iconName: "Smile" as const,
    theme: "standard" as const,
    schema: [
      {
        id: "fld_feedback_nps",
        type: "number",
        name: "npsScore",
        prompt: "On a scale of 0 to 10, how likely are you to recommend us to a colleague?",
        required: true,
        description: "Please enter a number between 0 (not likely) and 10 (extremely likely)",
      },
      {
        id: "fld_feedback_rating",
        type: "single_select",
        name: "generalRating",
        prompt: "How would you rate your overall experience?",
        required: true,
        options: [
          "Excellent (5 Stars)",
          "Good (4 Stars)",
          "Average (3 Stars)",
          "Poor (2 Stars)",
          "Terrible (1 Star)",
        ],
      },
      {
        id: "fld_feedback_reason",
        type: "long_text",
        name: "feedbackReason",
        prompt:
          "What is the primary reason for your score? (Your feedback directly drives our roadmap)",
        required: false,
      },
    ],
  },
  {
    title: "Job Application Form",
    description:
      "Standard HR collection tool. Must include File Upload fields for resumes, alongside fields for contact details and employment history.",
    iconName: "Briefcase" as const,
    theme: "standard" as const,
    schema: [
      {
        id: "fld_job_name",
        type: "short_text",
        name: "fullName",
        prompt: "Full Name",
        required: true,
      },
      {
        id: "fld_job_email",
        type: "email",
        name: "email",
        prompt: "Contact Email Address",
        required: true,
      },
      {
        id: "fld_job_resume",
        type: "file_upload",
        name: "resumeLink",
        prompt: "Resume/CV Upload",
        required: true,
        description: "Please upload your resume in PDF format (Max 5MB)",
      },
      {
        id: "fld_job_experience",
        type: "long_text",
        name: "experienceSummary",
        prompt: "Employment History & Summary of Experience",
        required: true,
      },
      {
        id: "fld_job_role",
        type: "single_select",
        name: "appliedPosition",
        prompt: "Which department / role are you applying for?",
        required: true,
        options: ["Engineering", "Product & Design", "Sales & Marketing", "Operations / HR"],
      },
    ],
  },
];

interface StarterTemplatesProps {
  onUseTemplate: (template: StarterTemplate, index: number) => void;
  isMutationPending: boolean;
  activeTemplateIdx: number | null;
}

export type StarterTemplate = (typeof STARTER_TEMPLATES)[number];

export function StarterTemplates({
  onUseTemplate,
  isMutationPending,
  activeTemplateIdx,
}: StarterTemplatesProps) {
  const renderTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case "Mail":
        return <Mail className="h-5 w-5 text-emerald-400" />;
      case "Users":
        return <Users className="h-5 w-5 text-emerald-400" />;
      case "Calendar":
        return <Calendar className="h-5 w-5 text-emerald-400" />;
      case "Smile":
        return <Smile className="h-5 w-5 text-emerald-400" />;
      case "Briefcase":
        return <Briefcase className="h-5 w-5 text-emerald-400" />;
      default:
        return <Mail className="h-5 w-5 text-emerald-400" />;
    }
  };

  return (
    <div className="mb-20">
      <h2 className="text-2xl font-semibold text-white mb-8 flex items-center gap-2.5">
        <LayoutTemplate className="h-6 w-6 text-emerald-400" />
        Starter Templates
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {STARTER_TEMPLATES.map((template, idx) => {
          const isPending = activeTemplateIdx === idx && isMutationPending;
          return (
            <div
              key={idx}
              className="bg-[#0A0A0A] border border-zinc-800/80 rounded-xl p-6 hover:border-zinc-700/80 transition-all duration-300 flex flex-col gap-4 shadow-2xl relative overflow-hidden group/item"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl group-hover/item:border-emerald-500/30 transition-colors">
                  {renderTemplateIcon(template.iconName)}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white leading-snug">
                    {template.title}
                  </h3>
                  <div className="inline-block mt-1">
                    <ThemeBadge theme={template.theme} />
                  </div>
                </div>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed font-sans mt-2">
                {template.description}
              </p>
              <div className="mt-auto pt-6 border-t border-zinc-900">
                <Button
                  onClick={() => onUseTemplate(template, idx)}
                  disabled={isMutationPending}
                  className="w-full text-sm font-semibold h-11 bg-white text-black hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <Spinner className="h-4 w-4 text-black" />
                      Cloning Blueprint...
                    </>
                  ) : (
                    <>
                      Use Template
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
