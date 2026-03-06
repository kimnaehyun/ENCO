// import './global.css';
// import RootNavigator from './src/navigation/RootNavigator';
// import { NavigationContainer } from '@react-navigation/native';
// function App() {
//   return (
//     <NavigationContainer>
//       <RootNavigator />;
//     </NavigationContainer>
//   );
// }

// export default App;

import './global.css';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import RootNavigator from './src/navigation/RootNavigator';
import { VotesProvider } from './src/contexts/VotesContext';

function App() {
  return (
    <VotesProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </VotesProvider>
  );
}

export default App;