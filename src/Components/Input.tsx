import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
  } from "@mui/material";

  interface Open{
    new:boolean,
    update:boolean
  }

const Input:React.FC<{open:Open,handleClose:()=>void,handleForm:(e:number)=>void}>=({open,handleClose,handleForm})=>{
    return(
        <Dialog open={open.new || open.update} onClose={handleClose}>
         <form onSubmit={(e:any)=>handleForm(e)}>
          <DialogTitle>{open.new ? "Create Grid" : "Update Grid"}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label={open.new ? "Rows" : "Increase / Decrease rows by "}
              type="number"
              fullWidth
              variant="outlined"
              name="rows"
            />
            <TextField
              margin="dense"
              label={open.new ? "Columns" : "Increase / Decrease columns by "}
              type="number"
              fullWidth
              variant="outlined"
              name="columns"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit"
            >
              {open.new ? "Create" : "Update"}
            </Button>
          </DialogActions>
          </form>
        </Dialog>
    )
}

export default Input;