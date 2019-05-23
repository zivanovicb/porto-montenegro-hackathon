import { isMobile } from 'react-device-detect';
import styled from 'styled-components';
import React from 'react';

import { DesktopView, MobileView } from '.';

const Container = styled.div`
  height: ${window.innerHeight}px;
`;

const App = () => {

  if (isMobile) {
    return (
      <Container>
        <MobileView />
      </Container>
    );
  }

  return (
    <Container>
      <DesktopView />
    </Container>
  );
}

export default App;