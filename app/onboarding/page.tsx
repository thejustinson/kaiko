import Image from "next/image"


export default function OnboardingPage() {
    return(
        <div className="bg-background h-dvh w-dvw flex flex-col items-center justify-center">
            <Image
                src='/kaiko-orange-icon.svg'
                alt='Kaiko Icon'
                width='131'
                height='105'
                className="w-[50px] h-[50px]"
            />
        </div>
    )
}