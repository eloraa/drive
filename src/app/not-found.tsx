import {
  StackedText,
  StackedTextWrapper,
} from '@/components/shared/stackedtext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const COLORS = [
  '#F44336',
  '#E91E63',
  '#8e4eff',
  '#5973ff',
  '#2196F3',
  '#16d4ed',
  '#5cfbcf',
  '#5cf362',
  '#b0ff54',
  '#edff40',
  '#ffc107',
  '#ff9800',
  '#ff5722',
];

const OddMarquee = () => (
  <StackedTextWrapper>
    {Array.from({ length: 3 }).map((_, i) => (
      <StackedText
        key={i}
        className='[&_div>h1]:animate-fontWeight flex items-center gap-4 font-mono text-8xl [&_div:nth-child(odd)>h1]:[animation-delay:1s] [&_div>h1:hover]:font-black [&_div>h1]:font-thin [&_div>h1]:transition-[font-weight,color]'
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            style={{ color: COLORS[Math.floor(Math.random() * COLORS.length)] }}
          >
            <h1 className='text-white hover:text-current'>404</h1>
          </div>
        ))}
      </StackedText>
    ))}
  </StackedTextWrapper>
);

const EvenMarquee = () => (
  <StackedTextWrapper>
    {Array.from({ length: 3 }).map((_, i) => (
      <StackedText
        key={i}
        className='[&_div>h1]:animate-fontWeight flex items-center gap-4 font-mono text-8xl [&_div:nth-child(even)>h1]:[animation-delay:1s] [&_div>h1:hover]:font-black [&_div>h1]:font-thin [&_div>h1]:transition-[font-weight,color]'
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            style={{ color: COLORS[Math.floor(Math.random() * COLORS.length)] }}
          >
            <h1 className='text-white hover:text-current'>404</h1>
          </div>
        ))}
      </StackedText>
    ))}
  </StackedTextWrapper>
);

export default async function NotFound() {
  return (
    <main className='flex h-full w-full items-center justify-center overflow-hidden'>
      <div>
        <OddMarquee />
        <EvenMarquee />
        <OddMarquee />
        <EvenMarquee />

        <StackedTextWrapper>
          {Array.from({ length: 3 }).map((_, i) => (
            <StackedText
              key={i}
              className='[&_div>button]:animate-fontWeight flex items-center gap-4 font-mono [&_div:nth-child(odd)>button]:[animation-delay:1s] [&_div>button:hover]:font-black [&_div>button]:text-6xl [&_div>button]:font-thin [&_div>button]:transition-[font-weight,color]'
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    color: COLORS[Math.floor(Math.random() * COLORS.length)],
                  }}
                >
                  <Button
                    variant='link'
                    className='h-auto w-auto rounded-none p-0 font-[inherit] text-current'
                  >
                    <Link href='/'>Go Back</Link>
                  </Button>
                </div>
              ))}
            </StackedText>
          ))}
        </StackedTextWrapper>

        <EvenMarquee />
        <OddMarquee />
        <EvenMarquee />
        <OddMarquee />
      </div>
    </main>
  );
}
