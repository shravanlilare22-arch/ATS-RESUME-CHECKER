from fastapi import APIRouter, HTTPException

from app.db.crud import delete_analysis, get_analysis, get_history

router = APIRouter()


@router.get("/history")
def history(limit: int = 20):
    return get_history(limit)


@router.get("/history/{analysis_id}")
def history_item(analysis_id: str):
    doc = get_analysis(analysis_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return doc


@router.delete("/history/{analysis_id}")
def history_delete(analysis_id: str):
    if not delete_analysis(analysis_id):
        raise HTTPException(status_code=404, detail="Analysis not found")
    return {"message": "Deleted", "id": analysis_id}