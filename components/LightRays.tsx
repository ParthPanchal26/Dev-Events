import React from 'react'

const LightRays = () => {
    return (
        <div>
            <div
                className="absolute inset-0 overflow-hidden"
                style={
                    {
                        "--aurora":
                            "repeating-linear-gradient(100deg,#10b981 10%,#34d399 15%,#6ee7b7 20%,#2dd4bf 25%,#14b8a6 30%)",
                        "--dark-gradient":
                            "repeating-linear-gradient(100deg,#000 0%,#000 7%,transparent 10%,transparent 12%,#000 16%)",
                        "--white-gradient":
                            "repeating-linear-gradient(100deg,#fff 0%,#fff 7%,transparent 10%,transparent 12%,#fff 16%)",
                        "--color-1": "#10b981",
                        "--color-2": "#34d399",
                        "--color-3": "#6ee7b7",
                        "--color-4": "#2dd4bf",
                        "--color-5": "#14b8a6",
                        "--black": "#000",
                        "--white": "#fff",
                        "--transparent": "transparent",
                        "--animation-speed": "15s",
                    } as React.CSSProperties
                }
            >
                <div
                    className='pointer-events-none absolute -inset-2.5
              [background-image:var(--white-gradient),var(--aurora)]
              bg-size-[300%,200%]
              bg-position-[50%_50%,50%_50%]
              opacity-50 blur-[10px] invert filter will-change-transform
              [--aurora:repeating-linear-gradient(100deg,var(--color-1)_10%,var(--color-2)_15%,var(--color-3)_20%,var(--color-4)_25%,var(--color-5)_30%)]
              [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
              [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]
              after:absolute after:inset-0
              after:[background-image:var(--white-gradient),var(--aurora)]
              after:bg-size-[200%,100%]
              after:bg-fixed
              after:mix-blend-difference
              after:content-[""]
              dark:[background-image:var(--dark-gradient),var(--aurora)]
              dark:invert-0
              after:dark:[background-image:var(--dark-gradient),var(--aurora)]
              after:animate-[aurora_var(--animation-speed)_linear_infinite]
              mask-[radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]'
                />
            </div>
        </div>
    )
}

export default LightRays