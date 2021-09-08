import React from 'react';
import { RectButtonProps } from 'react-native-gesture-handler';

import { Container, Button, Icon, Title } from './styles';

interface Props extends RectButtonProps {
  type: 'up' | 'down';
  title: string;
  isActive: boolean;
}

const icon = {
  up: 'arrow-up-circle',
  down: 'arrow-down-circle',
}

export function TransactionTypeButton ({ type, title, isActive, ...rest}: Props) {
  return(
    <Container 
      isActive={isActive}
      type={type}
    >
      <Button  {...rest}>
        <Icon 
          name={icon[type]}
          type={type}
        />
        <Title>{title}</Title>
      </Button>
    </Container>
  )
}