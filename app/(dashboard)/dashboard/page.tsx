'use client';

import { useState, useTransition } from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Loader2, Zap, Shield, HeartPulse } from 'lucide-react';
import { upsertDailyLog } from './actions';
import { User } from '@/lib/db/schema'; // Assuming User type is exported

// This would be fetched from the database in a real scenario
const MOCK_USER: User = {
    id: 1,
    name: 'Thomas',
    email: 'thomas@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    passwordHash: ''
};

type DailyLog = {
    id: number;
    energyLevel: 'low' | 'medium' | 'high';
    // other fields as needed
};

// --- Main Dashboard Component ---
export default function DashboardPage() {
    const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
    const user = MOCK_USER; // Using mock user for now

    const handleEnergyChange = async (level: 'low' | 'medium' | 'high') => {
        // In a real app, this would be a server action call
        // await upsertDailyLog(level);
        console.log(`Energy level set to: ${level}`);
        setDailyLog({ id: dailyLog?.id || Date.now(), energyLevel: level });
    };

    if (!user) {
        return <div>Loading user...</div>;
    }

    return (
        <section className="flex-1 p-4 lg:p-8 space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">
                    Welcome back, {user.name || 'User'}.
                </h1>
                <p className="text-muted-foreground">
                    Let's set the intention for today. How is your capacity right now?
                </p>
            </header>

            <EnergySelector
                currentLevel={dailyLog?.energyLevel}
                onLevelChange={handleEnergyChange}
            />

            {dailyLog && (
                <div className="animate-in fade-in-50 duration-500">
                    {dailyLog.energyLevel === 'low' && <LowCapacityView />}
                    {dailyLog.energyLevel === 'medium' && <MediumCapacityView />}
                    {dailyLog.energyLevel === 'high' && <HighCapacityView />}
                </div>
            )}
        </section>
    );
}


// --- UI Sub-Components ---

function EnergySelector({ currentLevel, onLevelChange }: { currentLevel?: 'low' | 'medium' | 'high', onLevelChange: (level: 'low' | 'medium' | 'high') => void }) {
    const [isPending, startTransition] = useTransition();

    const handleChange = (value: string) => {
        const level = value as 'low' | 'medium' | 'high';
        startTransition(() => {
            onLevelChange(level);
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Daily Capacity Check-in</CardTitle>
                <CardDescription>Select your current energy level to tailor your day.</CardDescription>
            </CardHeader>
            <CardContent>
                <RadioGroup
                    defaultValue={currentLevel}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    onValueChange={handleChange}
                    disabled={isPending}
                >
                    <Label htmlFor="low" className={`rounded-lg border-2 p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${currentLevel === 'low' ? 'border-red-500 bg-red-50' : 'border-muted'}`}>
                        <RadioGroupItem value="low" id="low" className="sr-only" />
                        <Shield className="h-8 w-8 text-red-600 mb-2" />
                        <span className="font-bold text-lg">Low Capacity</span>
                        <span className="text-sm text-center text-muted-foreground">Crisis Mode: Basics only.</span>
                    </Label>
                    <Label htmlFor="medium" className={`rounded-lg border-2 p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${currentLevel === 'medium' ? 'border-yellow-500 bg-yellow-50' : 'border-muted'}`}>
                        <RadioGroupItem value="medium" id="medium" className="sr-only" />
                        <HeartPulse className="h-8 w-8 text-yellow-600 mb-2" />
                        <span className="font-bold text-lg">Medium Capacity</span>
                        <span className="text-sm text-center text-muted-foreground">Standard Day: Focus on priorities.</span>
                    </Label>
                    <Label htmlFor="high" className={`rounded-lg border-2 p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${currentLevel === 'high' ? 'border-green-500 bg-green-50' : 'border-muted'}`}>
                        <RadioGroupItem value="high" id="high" className="sr-only" />
                        <Zap className="h-8 w-8 text-green-600 mb-2" />
                        <span className="font-bold text-lg">High Capacity</span>
                        <span className="text-sm text-center text-muted-foreground">Growth Day: Tackle bigger goals.</span>
                    </Label>
                </RadioGroup>
                {isPending && <Loader2 className="mt-4 h-5 w-5 animate-spin" />}
            </CardContent>
        </Card>
    );
}

// --- Placeholder View Components ---

function LowCapacityView() {
    return (
        <Card className="border-red-500/50">
            <CardHeader>
                <CardTitle className="text-red-700">Low Capacity Protocol: Active</CardTitle>
                <CardDescription>Focus only on the essentials. It's okay that today is hard. We'll take it one step at a time.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <h3 className="font-semibold">Anchor Tasks</h3>
                <p className="text-muted-foreground">[Anchor Task Checklist Component will go here]</p>
                 <Button variant="secondary">Access Dopamine Menu</Button>
            </CardContent>
        </Card>
    );
}

function MediumCapacityView() {
    return (
        <Card className="border-yellow-500/50">
            <CardHeader>
                <CardTitle className="text-yellow-700">Medium Capacity Plan</CardTitle>
                <CardDescription>Let's focus on what matters most today.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <h3 className="font-semibold">Anchor Tasks</h3>
                <p className="text-muted-foreground">[Anchor Task Checklist Component will go here]</p>
                <h3 className="font-semibold">Today's Top 3 Priorities</h3>
                <p className="text-muted-foreground">[Top 3 Priorities Component will go here]</p>
            </CardContent>
        </Card>
    );
}

function HighCapacityView() {
    return (
        <Card className="border-green-500/50">
            <CardHeader>
                <CardTitle className="text-green-700">High Capacity Plan</CardTitle>
                <CardDescription>A great day to make progress on bigger goals.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <h3 className="font-semibold">Anchor Tasks</h3>
                <p className="text-muted-foreground">[Anchor Task Checklist Component will go here]</p>
                <h3 className="font-semibold">Future Goals</h3>
                <p className="text-muted-foreground">[Future Goals / Floating Ideas Component will go here]</p>
            </CardContent>
        </Card>
    );
}
