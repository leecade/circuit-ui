/**
 * Copyright 2019, SumUp Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useState } from 'react';
import { includes, debounce, isString } from 'lodash/fp';
import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs/react';

import { uniqueId } from '../../util/id';

import docs from './AutoCompleteInput.docs.mdx';
import AutoCompleteInput from './AutoCompleteInput';
import Label from '../Label';
import Text from '../Text';

export default {
  title: 'Forms/Input/AutoCompleteInput',
  component: AutoCompleteInput,
  parameters: {
    docs: { page: docs },
    jest: ['AutoCompleteInput']
  }
};

const items = [
  'Apple',
  'Banana',
  'Cherries',
  'Pitaya (Dragonfruit)',
  'Kiwi',
  'Mango',
  'Honeydew Melon'
];

const icons = {
  Apple: '🍎',
  Banana: '🍌',
  Cherries: '🍒',
  'Pitaya (Dragonfruit)': '🐉',
  Kiwi: '🥝',
  Mango: '🥭',
  'Honeydew Melon': '🍈'
};

const filterOptions = (options, inputValue) => {
  if (!inputValue) {
    return options;
  }
  return options.filter(option => {
    const value = isString(option) ? option : option.value;
    return includes(inputValue.toLowerCase(), value.toLowerCase());
  });
};

// Inputs always need labels for accessibility.
const AutoCompleteInputWithLabel = props => {
  const id = uniqueId();
  return (
    <Label htmlFor={id}>
      {"What's your favourite fruit?"}
      <AutoCompleteInput
        clearOnSelect={boolean('clearOnSelect', false)}
        {...props}
        id={id}
      />
    </Label>
  );
};

export const base = () => (
  <AutoCompleteInputWithLabel
    options={items}
    onChange={action('onChange')}
    onInputValueChange={action('onInputValueChange')}
    onClear={action('onClear')}
    filterOptions={filterOptions}
  />
);

export const customOptions = () => {
  const options = items.map(value => ({
    value,
    children: (
      <Text size="giga" noMargin>
        {icons[value]} {value}
      </Text>
    )
  }));
  return (
    <AutoCompleteInputWithLabel
      options={options}
      onChange={action('onChange')}
      onInputValueChange={action('onInputValueChange')}
      onClear={action('onClear')}
      filterOptions={filterOptions}
    />
  );
};

export const preselected = () => (
  <AutoCompleteInputWithLabel
    initialSelectedItem={items[0]}
    options={items}
    onChange={action('onChange')}
    onInputValueChange={action('onInputValueChange')}
    onClear={action('onClear')}
    filterOptions={filterOptions}
  />
);

const AsyncAutoCompleteInput = () => {
  const [options, setOptions] = useState([]);

  const handleInputValueChange = debounce(200, inputValue => {
    action('onInputValueChange')(inputValue);
    setTimeout(() => {
      const filteredOptions = filterOptions(items, inputValue);
      setOptions(filteredOptions);
    }, 1000);
  });

  return (
    <AutoCompleteInputWithLabel
      options={options}
      onChange={action('onChange')}
      onInputValueChange={handleInputValueChange}
      onClear={action('onClear')}
    />
  );
};

export const asyncOptions = () => <AsyncAutoCompleteInput />;
