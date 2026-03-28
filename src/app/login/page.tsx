"use client";

import { useActionState } from "react";
import { authenticate } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, Mail, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
    const [errorMessage, dispatch, isPending] = useActionState(
        authenticate,
        undefined,
    );

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50/50 via-background to-purple-50/50 p-4 dark:from-indigo-950/50 dark:to-purple-950/50">
            <Card className="w-full max-w-md border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl">
                <CardHeader className="space-y-1 text-center">

                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200">
                        <KeyRound className="h-8 w-8 text-white" />

                    </div>

                    <CardTitle className="text-3xl font-bold tracking-tight text-foreground">HMS</CardTitle>
                    <CardDescription className="text-muted-foreground text-lg">
                        Login to manage your holdings
                    </CardDescription>
                </CardHeader>
                <form action={dispatch}>
                    <CardContent className="space-y-6">
                        {errorMessage && (
                            <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{errorMessage}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    required
                                    className="pl-10 h-12 bg-muted/50 text-foreground border-border/50 focus:border-indigo-500/50 transition-all rounded-xl"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
                            <div className="relative group">
                                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className="pl-10 h-12 bg-muted/50 text-foreground border-border/50 focus:border-indigo-500/50 transition-all rounded-xl"
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-6  mt-6">
                        <Button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Authenticating...
                                </>
                            ) : "Sign In"}
                        </Button>
                        {/* <div className="text-center text-sm text-muted-foreground">
                            Forgot your password? <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">Reset it</a>
                        </div> */}
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
