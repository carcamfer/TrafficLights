import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWaitlistSchema, type InsertWaitlist } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

export default function WaitlistForm() {
  const { toast } = useToast();
  const form = useForm<InsertWaitlist>({
    resolver: zodResolver(insertWaitlistSchema),
    defaultValues: {
      email: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: InsertWaitlist) => {
      const res = await apiRequest("POST", "/api/waitlist", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You've been added to the waitlist.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutate(data))}
        className="flex flex-col sm:flex-row gap-3"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  placeholder="Enter your email"
                  type="email"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Joining..." : "Join Waitlist"}
        </Button>
      </form>
    </Form>
  );
}
