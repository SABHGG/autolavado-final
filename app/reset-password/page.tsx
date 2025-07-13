import { Suspense } from 'react'
import RecoverOrResetForm from "@/components/recover-or-reset-form";

const ResetPasswordPage = () => {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <Suspense
                fallback={
                    <div className="w-full max-w-md p-6 rounded-lg bg-white shadow">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4 animate-pulse" />
                    </div>
                }
            >
                <div className="w-full max-w-sm">
                    <RecoverOrResetForm />
                </div>
            </Suspense>
        </div>

    )
}

export default ResetPasswordPage