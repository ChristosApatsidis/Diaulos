// app/page.tsx
"use client";

import { Card } from "@heroui/react";
import { Logo } from "@/components/icons";
import ActiveSession from "@/components/ui/surface/ActiveSession";
import SignIn from "@/components/ui/forms/SignIn";
import { authClient } from "@/lib/better-auth/auth-client";

export default function Home() {
  const {
    data: session,
    isPending: sessionIsPending,
    error: sessionError,
  } = authClient.useSession();

  if (sessionIsPending) {
    return (
      <main className="container mx-auto px-4">
        <p>Loading...</p>
      </main>
    );
  }

  if (sessionError) {
    return (
      <main className="container mx-auto px-4">
        <p>Error: {sessionError.message}</p>
      </main>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-2">
      <div className="grid lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2">
          <Card>
            <Card.Header>
              <Card.Title>
                <div className="flex items-center">
                  <Logo size={12} />
                  <h1 className="text-2xl font-bold">Δίαυλος</h1>
                </div>
              </Card.Title>
              <Card.Description>
                Visit the Acme Creator Hub to sign up today and start earning
                credits from your fans and followers.
              </Card.Description>
            </Card.Header>
            <Card.Footer></Card.Footer>
          </Card>
        </div>

        <div>{session ? <ActiveSession /> : <SignIn />}</div>
      </div>
    </div>
  );
}
