import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

// Define SearchBar component which takes in 3 parameters
// -- placeholder: a string which defines the text so show in an empty SearchBar (default is '')
// -- defaultValue: the text that should be present inside the SearchBar
// -- handleSearch: a function which handles the change in state of the SearchBar
export default function SearchBar({placeholder, defaultValue, handleSearch }) {
  return (
    <>
      <TextField
        fullWidth
        id='searchbar'
        label='Search'
        size='small'
        type='text'
        color='success'
        defaultValue={defaultValue} 
        placeholder= {placeholder ? placeholder : ''}
        onChange={handleSearch}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        variant='outlined'
      />
    </>
  );
}