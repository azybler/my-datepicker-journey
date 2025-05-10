import { MDXProvider } from '@mdx-js/react';
import Intro from './slides/intro.mdx';
import ButWhy from './slides/butWhy.mdx';
import FirstAttempt from './slides/firstAttempt.mdx';
import LetsDoItAgain from './slides/letsDoItAgain.mdx';
import WhatCanAIDo from './slides/whatCanAIDo.mdx';
import Presenting from './slides/presenting.mdx';
import PresentingDebug from './slides/PresentingDebug.mdx';
import TransformOrigin from './slides/transformOrigin.mdx';
import Overview from './slides/overview.mdx';
import AnimatingDayGridPart1 from './slides/animatingDayGridPart1.mdx';
import AnimatingDayGridPart2 from './slides/animatingDayGridPart2.mdx';
import TransformOriginExample from './slides/transformOriginExample.mdx';
import Finale from './slides/finale.mdx';
import WrapUp from './slides/wrapUp.mdx';
import { Deck } from './Deck';
import { mdxComponents } from './MDXComponents';

const App = () => (
  <MDXProvider components={mdxComponents}>
    <Deck
      slides={[
        <Intro key="1" />,
        <ButWhy key="2" />,
        <FirstAttempt key="3" />,
        <LetsDoItAgain key="4" />,
        <WhatCanAIDo key="5" />,
        <Presenting key="6" />,
        <Overview key="7" />,
        <AnimatingDayGridPart1 key="8" />,
        <AnimatingDayGridPart2 key="9" />,
        <PresentingDebug key="10" />,
        <TransformOrigin key="11" />,
        <TransformOriginExample key="12" />,
        <Finale key="13" />,
        <WrapUp key="14" />,
      ]}
    />
  </MDXProvider>
);

export default App;
