import { Form, Head } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome to the Dungeon" />
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <div className="flex flex-col items-center justify-center gap-4 text-center text-white w-1/2">
                        <div>Welcome to dungeons and dragons!</div>
                        <div className={"w-full"}>
                            <Form action={'/campaign/store'} method="post" className={"flex flex-col gap-2 w-full text-center"}>
                                <input
                                    type="text"
                                    name={"name"}
                                    placeholder="Enter your campaign name"
                                    className="rounded-lg border border-white px-4 py-2"
                                />
                                <textarea
                                    name={"world_description"}
                                    placeholder="Optional seed phrase to kickstart your adventure"
                                    className="rounded-lg border border-white px-4 py-2"
                                />
                                <button
                                    type={'submit'}
                                    data-testid="new-game-button"
                                    className={
                                        'rounded-lg border border-white px-4 py-2'
                                    }
                                >
                                    New Game
                                </button>
                            </Form>
                        </div>
                    </div>
                </div>
                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}
