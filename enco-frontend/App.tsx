import './global.css';
import RootNavigator from './src/navigation/RootNavigator';
import { NavigationContainer } from '@react-navigation/native';
function App() {
  return (
    <NavigationContainer>
      <RootNavigator />;
    </NavigationContainer>
  );
}

export default App;
