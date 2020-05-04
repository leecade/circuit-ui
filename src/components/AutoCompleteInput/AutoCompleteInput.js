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

import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { css } from '@emotion/core';
import Downshift from 'downshift';
import { includes, isString, isEmpty } from 'lodash/fp';

import SearchInput from '../SearchInput';
import Card from '../Card';
import Text from '../Text';
import { childrenPropType } from '../../util/shared-prop-types';

const MIN_INPUT_LENGTH = 2;

const autoCompleteWrapperStyles = ({ theme }) => css`
  label: input__container;
  position: relative;
  min-width: 150px;

  label > &,
  label + & {
    margin-top: ${theme.spacings.bit};
  }
`;

const AutoCompleteWrapper = styled('div')(autoCompleteWrapperStyles);

const optionsStyles = ({ theme }) => css`
  label: input__options;
  position: absolute;
  top: calc(100% + ${theme.spacings.bit});
  left: 0;
  right: 0;
  z-index: ${theme.zIndex.popover};
  padding: ${theme.spacings.bit} 0;
`;

const Options = styled(Card)(optionsStyles);

Options.defaultProps = Card.defaultProps;

const optionBaseStyles = ({ theme }) => css`
  label: input__option;
  cursor: pointer;
  margin: 0;
  text-overflow: ellipsis;
  overflow: hidden;
  padding: ${theme.spacings.byte} ${theme.spacings.mega};
`;

const optionSelectedStyles = ({ selected, theme }) =>
  selected &&
  css`
    label: input__option--selected;
    color: ${theme.colors.p500};
    background-color: ${theme.colors.n100};
  `;

const Option = styled(Text)(optionBaseStyles, optionSelectedStyles);

const defaultFilterOptions = (options, inputValue) => {
  if (!inputValue || inputValue.length < MIN_INPUT_LENGTH) {
    return options;
  }
  return options.filter(option => {
    const value = isString(option) ? option : option.value;
    return includes(inputValue.toLowerCase(), value.toLowerCase());
  });
};

const optionsPropType = PropTypes.arrayOf(
  PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      value: PropTypes.string,
      children: childrenPropType
    })
  ])
);

/**
 * Basic AutoCompleteInput input with styled suggestions list
 */
const AutoCompleteInput = ({
  options,
  onChange,
  clearOnSelect,
  onInputValueChange,
  filterOptions,
  maxNumberOfOptions,
  defaultInputValue,
  initialSelectedItem,
  onClear,
  ...inputProps
}) => {
  const downshiftRef = useRef(null);

  const baseHandleClear = () => {
    if (downshiftRef) {
      downshiftRef.current.clearSelection();
    }
    if (onClear) {
      onClear();
    }
  };

  const handleChange = value => {
    if (value) {
      onChange(value);

      if (clearOnSelect) {
        baseHandleClear();
      }
    }
  };

  const handleDownShiftRef = ref => {
    downshiftRef.current = ref;
  };

  const handleClear = onClear ? baseHandleClear : null;

  return (
    <Downshift
      ref={handleDownShiftRef}
      onSelect={handleChange}
      onInputValueChange={onInputValueChange}
      initialSelectedItem={initialSelectedItem}
      defaultInputValue={defaultInputValue}
    >
      {({
        getRootProps,
        getInputProps,
        getItemProps,
        inputValue,
        isOpen,
        highlightedIndex
      }) => {
        const filteredOptions = filterOptions(options, inputValue);
        const maxOptions = filteredOptions.slice(0, maxNumberOfOptions);

        return (
          <AutoCompleteWrapper {...getRootProps({ refKey: 'ref' })}>
            <SearchInput
              {...getInputProps(inputProps)}
              onClear={handleClear}
              noMargin
            />
            {isOpen && !isEmpty(maxOptions) && (
              <Options spacing={Card.MEGA}>
                {maxOptions.map((option, index) => {
                  const item = isString(option) ? { value: option } : option;
                  const { value, children = value, ...rest } = item;
                  return (
                    <Option
                      {...getItemProps({ item: value })}
                      key={value}
                      selected={index === highlightedIndex}
                      noMargin
                      {...rest}
                    >
                      {children}
                    </Option>
                  );
                })}
              </Options>
            )}
          </AutoCompleteWrapper>
        );
      }}
    </Downshift>
  );
};

AutoCompleteInput.propTypes = {
  /**
   * A collection of options that can be selected. An option can be a string
   * or an object with a `value` and an optional `children` property.
   * Additional properties are spread on the option element.
   */
  options: optionsPropType.isRequired,
  /**
   * Callback function that is called when the user selects a value
   */
  onChange: PropTypes.func.isRequired,
  /**
   * Callback function that is called as the user is typing
   */
  onInputValueChange: PropTypes.func,
  /**
   * A function that receives all options and the current input value
   * and returns the filtered options.
   */
  filterOptions: PropTypes.func,
  /**
   * The maximum number of suggestions to show to the user
   */
  maxNumberOfOptions: PropTypes.number,
  /**
   * Whether to clean the input after a value is selected
   */
  clearOnSelect: PropTypes.bool,
  /**
   * Callback function that is called when the user clears the input
   */
  onClear: PropTypes.func,
  /**
   * This is the initial input value.
   */
  defaultInputValue: PropTypes.string,
  /**
   * Pass an option or an array of options that should be selected by default.
   */
  initialSelectedItem: PropTypes.string
};

AutoCompleteInput.defaultProps = {
  filterOptions: defaultFilterOptions,
  maxNumberOfOptions: 7,
  clearOnSelect: false
};

/**
 * @component
 */
export default AutoCompleteInput;
