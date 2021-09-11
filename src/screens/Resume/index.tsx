import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VictoryPie } from 'victory-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { addMonths, subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';


import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from 'styled-components';
import { useAuth } from '../../hooks/auth';


import { HistoryCard } from '../../components/HistoryCard';
import { TransactionCardProps } from '../../components/TransactionCard';
import { categories } from '../../utils/categories';

import {
  Container,
  LoadingContainer,
  Header,
  Title,
  Content,
  MonthSelect,
  MonthSelectButton,
  MonthSelectIcon,
  Month,
  ChartContainer
} from './styled';

interface CategoryData{
  name: string;
  total: number;
  color: string;
  totalFormatted: string;
  percent: string;
}

export function Resume() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [totalByCategoires, setTotalByCategoires] = useState<CategoryData[]>([])

  const theme = useTheme();
  const { user } = useAuth()

  function handleDateChange(action: 'next' | 'prev'){
    if(action === 'next') {
      setSelectedDate(addMonths(selectedDate, 1));
    } else {
      setSelectedDate(subMonths(selectedDate, 1));
    }
  }


  async function loadData() {
    setIsLoading(true);

    const dataKey = `@gofinances:transactions_user:${user.id}`
    const resp = await AsyncStorage.getItem(dataKey);

    const respFormatted = resp ? JSON.parse(resp) : [];

    const expensives = respFormatted
      .filter((expensive: TransactionCardProps) => 
        expensive.type === 'down' &&
        new Date(expensive.date).getMonth() === selectedDate.getMonth() &&
        new Date(expensive.date).getFullYear() === selectedDate.getFullYear()
      );

    const expensiveTotal = expensives.reduce((acumullator: number, expensive: TransactionCardProps) => {
      return acumullator + Number(expensive.amount)
    }, 0)

    const totalByCatygory: CategoryData[] = [];

    categories.forEach(category => {
      let categorySum = 0;

      expensives.forEach((expensive: TransactionCardProps) => {
        if(expensive.category === category.key){
          categorySum += Number(expensive.amount);
        }
      })

      if(categorySum > 0) {

        const percent = `${(categorySum / expensiveTotal * 100).toFixed(0)}%`

        totalByCatygory.push({
          name: category.name,
          totalFormatted: categorySum.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }),
          total: categorySum,
          color: category.color,
          percent,
        })
      }
    })

    setTotalByCategoires(totalByCatygory);
    setIsLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, [selectedDate])
  );

  return(
    <Container>
      <Header>
        <Title>Resumo por categoria</Title>
      </Header>
      {
        isLoading ? 
        <LoadingContainer>
          <ActivityIndicator 
            color={theme.colors.primary}
            size='large'
          /> 
        </LoadingContainer> :
        <Content
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: useBottomTabBarHeight(),
          }}
        >
          <MonthSelect>
            <MonthSelectButton onPress={() => handleDateChange('prev')}>
              <MonthSelectIcon name='chevron-left'/>
            </MonthSelectButton>

            <Month>{format(selectedDate, 'MMMM, yyyy', {locale: ptBR})}</Month>

            <MonthSelectButton onPress={() => handleDateChange('next')}>
              <MonthSelectIcon name='chevron-right'/>
            </MonthSelectButton>
          </MonthSelect>

          <ChartContainer>
            <VictoryPie 
              data={totalByCategoires}
              colorScale={totalByCategoires.map(item => item.color)}
              style={{
                labels: {
                  fontSize: RFValue(18),
                  fontWeight: 'bold',
                  fill: theme.colors.shape
                }
              }}
              labelRadius={70}
              x='percent'
              y='total'
            />
          </ChartContainer>

          {totalByCategoires.map((item, index) => (
            <HistoryCard
              key={index} 
              color={item.color}
              title={item.name}
              amount={item.totalFormatted}
            />
          ))}
        </Content>
      }            
    </Container>
  )
}